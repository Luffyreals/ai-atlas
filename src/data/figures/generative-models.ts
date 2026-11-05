// Words of GenerativeModelsFigure (cv/vae-gan, "Minh họa"): two ways to make an image. VAE: the image x goes
// through the encoder into μ, σ; z = μ + σ ⊙ ε is sampled with noise ε coming in from the side; the decoder
// rebuilds the image; the two loss terms are "reconstruction" (input against output) and "KL" (at μ, σ). GAN:
// noise z goes through G into a fake image; real and fake images both go into D, which says real or fake. The
// symbols x, μ, σ, z, ε, G, D are drawn with FigMath / FigFormula in the component (⊙ is not in Barlow's
// subsets, so the formula of z is in the caption). Boxes are [main, small...] or several main lines.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'vae'
  | 'vaeName'
  | 'image'
  | 'encoder'
  | 'kl'
  | 'sample'
  | 'noiseNote'
  | 'decoder'
  | 'rebuilt'
  | 'reconstruction'
  | 'gan'
  | 'ganName'
  | 'noise'
  | 'generator'
  | 'fake'
  | 'real'
  | 'realNote'
  | 'discriminator'
  | 'verdict';

export const GENERATIVE_MODELS = {
  vi: {
    caption:
      'VAE rút $\\mathbf{z} = \\boldsymbol\\mu + \\boldsymbol\\sigma \\odot \\boldsymbol\\epsilon$ với $\\boldsymbol\\epsilon \\sim \\mathcal{N}(\\mathbf{0}, \\mathbf{I})$, nên gradient đi qua được $\\boldsymbol\\mu$ và $\\boldsymbol\\sigma$. GAN lấy $\\mathbf{z}$ từ nhiễu thuần; $D$ ở đây là bộ phân biệt, không phải số chiều.',
    label: 'Sơ đồ hai mô hình sinh ảnh: VAE và GAN',
    description:
      'Hàng trên là VAE: ảnh x qua bộ mã hóa thành hai vectơ mu và sigma, nơi đặt loss KL. Từ mu, sigma và nhiễu epsilon đi vào từ bên cạnh, bước lấy mẫu cho z; bộ giải mã biến z thành ảnh tái tạo, nằm ngay dưới ảnh vào, nối với nó bằng loss tái tạo. ' +
      'Hàng dưới là GAN: nhiễu z qua bộ sinh G thành ảnh giả. Ảnh thật, lấy từ dữ liệu huấn luyện, và ảnh giả cùng đi vào bộ phân biệt D, D trả lời thật hay giả. Ảnh thật không bao giờ đi qua G.',
    labels: {
      vae: 'VAE',
      vaeName: 'bộ tự mã hóa biến phân',
      image: 'Ảnh',
      encoder: 'Bộ mã hóa',
      kl: 'loss KL',
      sample: 'Lấy mẫu',
      noiseNote: 'nhiễu',
      decoder: 'Bộ giải mã',
      rebuilt: ['Ảnh', 'tái tạo'],
      reconstruction: 'loss tái tạo',
      gan: 'GAN',
      ganName: 'mạng đối nghịch tạo sinh',
      noise: 'Nhiễu',
      generator: 'Bộ sinh',
      fake: ['Ảnh', 'giả'],
      real: ['Ảnh', 'thật'],
      realNote: 'từ dữ liệu huấn luyện',
      discriminator: ['Bộ phân', 'biệt'],
      verdict: 'Thật hay giả?',
    },
  },
  en: {
    caption:
      'A VAE draws $\\mathbf{z} = \\boldsymbol\\mu + \\boldsymbol\\sigma \\odot \\boldsymbol\\epsilon$ with $\\boldsymbol\\epsilon \\sim \\mathcal{N}(\\mathbf{0}, \\mathbf{I})$, so the gradient can flow through $\\boldsymbol\\mu$ and $\\boldsymbol\\sigma$. A GAN takes $\\mathbf{z}$ from pure noise; $D$ here is the discriminator, not a number of dimensions.',
    label: 'Diagram of two image generators: VAE and GAN',
    description:
      'The top row is the VAE: the image x goes through the encoder into two vectors, mu and sigma, where the KL loss sits. From mu, sigma and the noise epsilon coming in from the side, the sampling step gives z; the decoder turns z into the rebuilt image, right under the input image and linked to it by the reconstruction loss. ' +
      'The bottom row is the GAN: noise z goes through the generator G into a fake image. Real images, from the training data, and fake ones both go into the discriminator D, which answers real or fake. Real images never go through G.',
    labels: {
      vae: 'VAE',
      vaeName: 'variational autoencoder',
      image: 'Image',
      encoder: 'Encoder',
      kl: 'KL loss',
      sample: 'Sample',
      noiseNote: 'noise',
      decoder: 'Decoder',
      rebuilt: ['Output', 'rebuilt'],
      reconstruction: 'reconstruction loss',
      gan: 'GAN',
      ganName: 'generative adversarial network',
      noise: 'Noise',
      generator: 'Generator',
      fake: ['Fake', 'image'],
      real: ['Real', 'image'],
      realNote: 'from the training data',
      discriminator: ['Discri-', 'minator'],
      verdict: 'Real or fake?',
    },
  },
} satisfies FigureText<Key>;
