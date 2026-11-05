// Words of ClipContrastiveFigure (cv/clip-blip-glip, "Minh họa"): a batch of N = 3 image–caption pairs. The
// images go through the image encoder f into u_1..u_3 (left column), the captions through the text encoder g
// into v_1..v_3 (top row); the 3 × 3 matrix holds S_ij = u_i^T v_j, the diagonal (right pairs) is pulled up,
// the rest pushed down; softmax runs along each row (image to text) and each column (text to image). The
// images are drawn shapes (circle, square, triangle) and the symbols f, g, u, v, S are drawn with FigMath in
// the component; here are only the words. `captions` holds one caption per entry, each [line, line].
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'images'
  | 'texts'
  | 'circle'
  | 'square'
  | 'triangle'
  | 'imageEncoder'
  | 'textEncoder'
  | 'right'
  | 'wrong'
  | 'rows'
  | 'columns';

export const CLIP_CONTRASTIVE = {
  vi: {
    caption:
      'Một lô $N = 3$ cặp ảnh–chú thích cho ma trận $N \\times N$ với $S_{ij} = \\mathbf{u}_i^\\top \\mathbf{v}_j$. InfoNCE đối xứng lấy softmax của $\\mathbf{S}/\\tau$ theo hàng và theo cột: đường chéo được kéo lên, mọi ô khác bị đẩy xuống.',
    label: 'Sơ đồ học tương phản của CLIP: ma trận độ tương tự giữa N ảnh và N chú thích',
    description:
      'Ba ảnh, một hình tròn, một hình vuông và một tam giác, đi qua bộ mã hóa ảnh f thành ba vectơ u1, u2, u3 xếp thành cột bên trái. ' +
      'Ba chú thích "hình tròn", "hình vuông", "tam giác" đi qua bộ mã hóa chữ g thành ba vectơ v1, v2, v3 xếp thành hàng trên cùng. ' +
      'Lưới 3 × 3 ghi S ij, tích vô hướng của u i và v j. Ba ô đường chéo S11, S22, S33 là cặp đúng, viền nhấn, được kéo lên; sáu ô còn lại là cặp sai, bị đẩy xuống. ' +
      'Softmax lấy theo từng hàng, mỗi ảnh tìm chú thích của nó, và theo từng cột, mỗi chú thích tìm ảnh của nó.',
    labels: {
      images: '3 ảnh',
      texts: '3 chú thích',
      circle: ['Hình', 'tròn'],
      square: ['Hình', 'vuông'],
      triangle: ['Tam', 'giác'],
      imageEncoder: 'Bộ mã hóa ảnh',
      textEncoder: 'Bộ mã hóa chữ',
      right: ['Cặp đúng', 'kéo lên'],
      wrong: ['Cặp sai', 'đẩy xuống'],
      rows: 'Softmax theo hàng: mỗi ảnh',
      columns: 'Softmax theo cột: mỗi chú thích',
    },
  },
  en: {
    caption:
      'A batch of $N = 3$ image–caption pairs gives an $N \\times N$ matrix with $S_{ij} = \\mathbf{u}_i^\\top \\mathbf{v}_j$. The symmetric InfoNCE loss takes the softmax of $\\mathbf{S}/\\tau$ along rows and along columns: the diagonal is pulled up, every other cell pushed down.',
    label: 'Diagram of CLIP contrastive learning: the similarity matrix of N images and N captions',
    description:
      'Three images, a circle, a square and a triangle, go through the image encoder f into three vectors u1, u2, u3, stacked as the left column. ' +
      'Three captions, "a circle", "a square", "a triangle", go through the text encoder g into three vectors v1, v2, v3, laid out as the top row. ' +
      'The 3 × 3 grid holds S ij, the dot product of u i and v j. The three diagonal cells S11, S22, S33 are the matching pairs, with the accent border, pulled up; the other six do not match and are pushed down. ' +
      'The softmax runs along each row, each image looking for its caption, and along each column, each caption looking for its image.',
    labels: {
      images: '3 images',
      texts: '3 captions',
      circle: ['A', 'circle'],
      square: ['A', 'square'],
      triangle: ['A', 'triangle'],
      imageEncoder: 'Image encoder',
      textEncoder: 'Text encoder',
      right: ['Match', 'raised'],
      wrong: ['No match', 'lowered'],
      rows: 'Softmax along rows: each image',
      columns: 'Softmax along columns: each caption',
    },
  },
} satisfies FigureText<Key>;
