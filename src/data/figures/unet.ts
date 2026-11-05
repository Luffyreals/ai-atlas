// Words of UnetFigure (cv/semantic-segmentation, "Minh họa"): the lesson's TinyUNet
// (src/code/cv/semantic-segmentation/tiny-unet.vi.py): a 32 × 32 × 1 image, e1 (32 × 32, 16 channels), max
// pooling, e2 (16 × 16, 32), max pooling, the bottom (8 × 8, 64); up by a 2 × 2 transposed convolution, joined
// with e2, d2 (16 × 16, 32); up, joined with e1, d1 (32 × 32, 16); a 1 × 1 convolution gives the 32 × 32 mask of
// K = 3 classes. The spatial sizes ("32 × 32") are drawn with FigFormula in the component; here are only the
// words. Every block is [main, small...] or one main line.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'input'
  | 'e1'
  | 'e2'
  | 'bottom'
  | 'd2'
  | 'd1'
  | 'mask'
  | 'pool'
  | 'up'
  | 'head'
  | 'skip'
  | 'down'
  | 'upward';

export const UNET = {
  vi: {
    caption:
      'Mỗi tầng xuống, cạnh giảm nửa và số kênh gấp đôi; nối tắt ghép bản đồ của nhánh co vào nhánh giãn, nên khối d2 nhận $32 + 32 = 64$ kênh. Số khớp ô PyTorch của bài.',
    label: 'Sơ đồ UNet hình chữ U: nhánh co, nhánh giãn và nối tắt giữa hai nhánh',
    description:
      'Hình chữ U, đọc từ trái trên xuống đáy rồi lên phải trên. Nhánh co: ảnh vào 32 × 32, 1 kênh, qua khối e1 32 × 32 với 16 kênh, max pooling 2 × 2, khối e2 16 × 16 với 32 kênh, max pooling, tới đáy 8 × 8 với 64 kênh. ' +
      'Nhánh giãn: phóng lên 2 lần thành 16 × 16, nối kênh với e2, khối d2 16 × 16 với 32 kênh; phóng lên thành 32 × 32, nối kênh với e1, khối d1 32 × 32 với 16 kênh; tích chập 1 × 1 cho mask ra 32 × 32 với 3 lớp. ' +
      'Hai mũi tên nối tắt nét đứt đi ngang từ e1 sang d1 và từ e2 sang d2, mang chi tiết của nhánh co sang nhánh giãn cùng tầng.',
    labels: {
      input: ['Ảnh vào', '1 kênh'],
      e1: ['e1', '16 kênh'],
      e2: ['e2', '32 kênh'],
      bottom: ['Đáy', '64 kênh'],
      d2: ['d2', '32 kênh'],
      d1: ['d1', '16 kênh'],
      mask: ['Mask ra', '3 lớp'],
      pool: 'Max pooling 2 × 2',
      up: 'Phóng lên 2×',
      head: 'Tích chập 1 × 1',
      skip: 'Nối tắt (nối kênh)',
      down: 'Nhánh co',
      upward: 'Nhánh giãn',
    },
  },
  en: {
    caption:
      'Each level down halves the side and doubles the channels; the skip connections join the maps of the contracting path to the expanding path, so block d2 takes in $32 + 32 = 64$ channels. The numbers match the lesson\'s PyTorch cell.',
    label: 'Diagram of a U-shaped UNet: contracting path, expanding path and skip connections between them',
    description:
      'A U shape, read from the top left down to the bottom, then up to the top right. Contracting path: a 32 × 32 input image with 1 channel goes through block e1, 32 × 32 with 16 channels, 2 × 2 max pooling, block e2, 16 × 16 with 32 channels, max pooling, down to the bottom, 8 × 8 with 64 channels. ' +
      'Expanding path: upsampled 2 times to 16 × 16, joined channel-wise with e2, block d2, 16 × 16 with 32 channels; upsampled to 32 × 32, joined with e1, block d1, 32 × 32 with 16 channels; a 1 × 1 convolution gives the 32 × 32 output mask with 3 classes. ' +
      'Two dashed skip arrows run across from e1 to d1 and from e2 to d2, carrying the detail of the contracting path to the expanding path at the same level.',
    labels: {
      input: ['Input image', '1 channel'],
      e1: ['e1', '16 channels'],
      e2: ['e2', '32 channels'],
      bottom: ['Bottom', '64 channels'],
      d2: ['d2', '32 channels'],
      d1: ['d1', '16 channels'],
      mask: ['Output mask', '3 classes'],
      pool: 'Max pooling 2 × 2',
      up: 'Upsample 2×',
      head: '1 × 1 convolution',
      skip: 'Skip (concatenate)',
      down: 'Contracting',
      upward: 'Expanding',
    },
  },
} satisfies FigureText<Key>;
