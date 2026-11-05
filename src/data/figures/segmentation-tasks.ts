// Words of SegmentationTasksFigure (cv/instance-universal-segmentation, "Minh họa"): one scene drawn as tiles
// (sky above; road, two people touching shoulders and a car below), answered three times: semantic (one
// region per class, the two people merged), instance (one mask per countable object, sky and road left
// empty), panoptic (both). Each panel has a name and a one-phrase rule on its left (`*Rule`, up to 3 lines).
// Region boxes are one main line, or [main, small] for an object and its number.
// vi follows the lesson's FIG comment; en is a draft for lesson-translator.
import type { FigureText } from './types';

type Key =
  | 'semantic'
  | 'semanticRule'
  | 'instance'
  | 'instanceRule'
  | 'panoptic'
  | 'panopticRule'
  | 'sky'
  | 'road'
  | 'people'
  | 'person1'
  | 'person2'
  | 'car'
  | 'car1'
  | 'empty';

export const SEGMENTATION_TASKS = {
  vi: {
    caption:
      'Semantic gộp hai người thành một vùng; instance tách họ nhưng bỏ stuff (trời, đường); panoptic gán cho mọi pixel một cặp (lớp, mã đối tượng) và được đo bằng PQ.',
    label: 'Sơ đồ ba bài toán phân đoạn trên cùng một cảnh: semantic, instance và panoptic',
    description:
      'Cùng một cảnh vẽ bằng ô, lặp ba lần: dải trời phía trên; phía dưới là đường, hai người đứng sát nhau chạm vai và một chiếc xe. ' +
      'Semantic, mỗi pixel một lớp: trời, đường, xe mỗi lớp một vùng, còn hai người gộp thành một vùng "người" duy nhất, viền nhấn. ' +
      'Instance, mỗi vật một mask: trời và đường bỏ trống, viền chấm; người 1 viền nhấn, người 2 viền đứt, xe 1 viền thường, mỗi mask có số riêng. ' +
      'Panoptic, mỗi pixel một lớp và một mã vật: trời và đường như semantic, người và xe như instance.',
    labels: {
      semantic: 'Semantic',
      semanticRule: ['mỗi pixel', 'một lớp'],
      instance: 'Instance',
      instanceRule: ['mỗi vật', 'một mask'],
      panoptic: 'Panoptic',
      panopticRule: ['mỗi pixel một', 'lớp và một', 'mã vật'],
      sky: 'Trời',
      road: 'Đường',
      people: 'Người',
      person1: ['Người', 'số 1'],
      person2: ['Người', 'số 2'],
      car: 'Xe',
      car1: ['Xe', 'số 1'],
      empty: 'Bỏ trống',
    },
  },
  en: {
    caption:
      'Semantic merges the two people into one region; instance separates them but leaves out the stuff (sky, road); panoptic gives every pixel a pair (class, object id) and is scored with PQ.',
    label: 'Diagram of three segmentation tasks on one scene: semantic, instance and panoptic',
    description:
      'One scene drawn as tiles, repeated three times: a band of sky above; below it a road, two people standing shoulder to shoulder and a car. ' +
      'Semantic, one class per pixel: sky, road and car are one region each, and the two people merge into a single "person" region, with the accent border. ' +
      'Instance, one mask per object: sky and road are left empty, with a dotted border; person 1 has the accent border, person 2 a dashed one, car 1 a plain one, each mask with its own number. ' +
      'Panoptic, a class and an object id per pixel: sky and road as in semantic, the people and the car as in instance.',
    labels: {
      semantic: 'Semantic',
      semanticRule: ['one class', 'per pixel'],
      instance: 'Instance',
      instanceRule: ['one mask', 'per object'],
      panoptic: 'Panoptic',
      panopticRule: ['a class and', 'an object id', 'per pixel'],
      sky: 'Sky',
      road: 'Road',
      people: 'Person',
      person1: ['Person', 'no. 1'],
      person2: ['Person', 'no. 2'],
      car: 'Car',
      car1: ['Car', 'no. 1'],
      empty: 'Left empty',
    },
  },
} satisfies FigureText<Key>;
