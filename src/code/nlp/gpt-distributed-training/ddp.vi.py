# DDP: 2 tiến trình CPU cùng huấn luyện một GPT tí hon, backend gloo
import torch
import torch.distributed as dist
import torch.multiprocessing as mp
from torch import nn
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler, TensorDataset

# 4 câu đầu Truyện Kiều làm dữ liệu
TEXT = ("trăm năm trong cõi người ta,\nchữ tài chữ mệnh khéo là ghét nhau.\n"
"trải qua một cuộc bể dâu,\nnhững điều trông thấy mà đau đớn lòng.\n")
L, D, WORLD = 16, 32, 2  # độ dài ngữ cảnh, số chiều, số tiến trình
ADDR = "tcp://127.0.0.1:29500"  # nơi các tiến trình hẹn gặp nhau


class TinyGPT(nn.Module):
    def __init__(self, vocab):
        super().__init__()
        self.tok, self.pos = nn.Embedding(vocab, D), nn.Embedding(L, D)
        self.block = nn.TransformerEncoderLayer(  # một khối Transformer
            D, 2, 4 * D, dropout=0.0, batch_first=True, norm_first=True)
        self.head = nn.Linear(D, vocab)

    def forward(self, w):  # w: (B, L + 1). Đoán ký tự 2..L+1 từ 1..L
        h = self.tok(w[:, :-1]) + self.pos(torch.arange(L))
        mask = nn.Transformer.generate_square_subsequent_mask(L)
        z = self.head(self.block(h, src_mask=mask, is_causal=True))
        return nn.functional.cross_entropy(z.mT, w[:, 1:])  # loss


def worker(rank):
    dist.init_process_group("gloo", init_method=ADDR,
                            rank=rank, world_size=WORLD)
    chars = sorted(set(TEXT))
    ids = torch.tensor([chars.index(c) for c in TEXT])
    data = TensorDataset(ids.unfold(0, L + 1, 1))  # mọi đoạn L + 1 ký tự
    sampler = DistributedSampler(data, WORLD, rank, seed=0)  # chia dữ liệu
    loader = DataLoader(data, batch_size=16, sampler=sampler)
    torch.manual_seed(rank)  # cố ý khởi tạo khác nhau ở mỗi rank
    model = DDP(TinyGPT(len(chars)))  # DDP chép tham số của rank 0 sang
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
    for epoch in range(1, 31):
        sampler.set_epoch(epoch)  # mỗi epoch xáo trộn một kiểu
        for (w,) in loader:
            loss = model(w)
            opt.zero_grad()
            loss.backward()  # DDP all-reduce gradient ngay trong bước này
            opt.step()
        if epoch % 10 == 0:
            print(f"rank {rank} epoch {epoch} loss {loss.item():.3f}")
    flat = torch.cat([p.detach().flatten() for p in model.parameters()])
    both = [torch.zeros_like(flat) for _ in range(WORLD)]
    dist.all_gather(both, flat)  # gom tham số của mọi rank về
    if rank == 0:
        print(f"{len(sampler)} windows/rank, {flat.numel()} params")
        print(f"max |rank0 - rank1| = {(both[0] - both[1]).abs().max():.1e}")
    dist.destroy_process_group()

if __name__ == "__main__":
    mp.spawn(worker, nprocs=WORLD)  # chạy worker(0) và worker(1)
