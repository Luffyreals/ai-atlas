// Words of ContainerImageFigure (llm/docker-cloud, "Lý thuyết"; reused in llm/deploy-custom-model): an image
// is a read-only stack of layers; each container run from it shares those layers and adds a temporary write
// layer of its own. Two stacks of image layers, chosen by the component's `stack` prop, each matching its
// lesson's Dockerfile: "chat" (docker-cloud: python:3.12-slim, openai and gradio, app.py) and "api"
// (deploy-custom-model: python:3.14-slim, fastapi, uvicorn and scikit-learn, app.py and model.joblib). Only
// the three layer labels and the description change; CONTAINER_IMAGE_API holds the "api" description.
// The layer labels and `write` are [main, small]. vi follows the lessons' FIG comments; en is a draft for
// lesson-translator.
import type { Locale } from '../roadmap';
import type { FigureText } from './types';

type Key =
  | 'image'
  | 'base'
  | 'pip'
  | 'code'
  | 'apiBase'
  | 'apiPip'
  | 'apiCode'
  | 'dockerRun'
  | 'container1'
  | 'container2'
  | 'write'
  | 'shared';

export const CONTAINER_IMAGE = {
  vi: {
    caption:
      'Một image dựng một lần, chạy được thành nhiều container; mỗi container chỉ ghi vào lớp trên cùng của nó, image không đổi.',
    label: 'Sơ đồ image và container: một chồng lớp chỉ đọc, hai container chạy từ nó',
    description:
      'Bên trên là image, chỉ đọc, gồm ba lớp xếp từ dưới lên: base image python:3.12-slim, các gói pip openai và gradio, rồi code app.py. ' +
      'Lệnh docker run chạy image đó thành hai container, container 1 và container 2. ' +
      'Mỗi container dùng chung ba lớp của image và chỉ thêm ở trên cùng một lớp ghi tạm của riêng nó; lớp ghi mất khi xóa container, còn image không đổi.',
    labels: {
      image: 'Image (chỉ đọc)',
      base: ['python:3.12-slim', 'base image'],
      pip: ['Gói pip', 'openai, gradio'],
      code: ['Code', 'app.py'],
      apiBase: ['python:3.14-slim', 'base image'],
      apiPip: ['Gói pip', 'fastapi, uvicorn, scikit-learn'],
      apiCode: ['Code', 'app.py, model.joblib'],
      dockerRun: 'docker run',
      container1: 'Container 1',
      container2: 'Container 2',
      write: ['Lớp ghi tạm', 'mất khi xóa container'],
      shared: 'lớp image dùng chung',
    },
  },
  en: {
    caption:
      'An image is built once and can run as many containers; each container writes only to its own top layer, and the image does not change.',
    label: 'Diagram of an image and its containers: one read-only stack of layers, two containers run from it',
    description:
      'At the top is the image, read-only, made of three layers from the bottom up: the base image python:3.12-slim, the pip packages openai and gradio, then the code app.py. ' +
      'The docker run command runs that image as two containers, container 1 and container 2. ' +
      'Each container shares the three image layers and adds only a temporary write layer of its own on top; the write layer is lost when the container is removed, and the image does not change.',
    labels: {
      image: 'Image (read-only)',
      base: ['python:3.12-slim', 'base image'],
      pip: ['pip packages', 'openai, gradio'],
      code: ['Code', 'app.py'],
      apiBase: ['python:3.14-slim', 'base image'],
      apiPip: ['pip packages', 'fastapi, uvicorn, scikit-learn'],
      apiCode: ['Code', 'app.py, model.joblib'],
      dockerRun: 'docker run',
      container1: 'Container 1',
      container2: 'Container 2',
      write: ['Write layer', 'gone with the container'],
      shared: 'shared image layers',
    },
  },
} satisfies FigureText<Key>;

/** The description of the "api" stack (deploy-custom-model): the same figure with that lesson's layers. */
export const CONTAINER_IMAGE_API: Record<Locale, { description: string }> = {
  vi: {
    description:
      'Bên trên là image, chỉ đọc, gồm ba lớp xếp từ dưới lên: base image python:3.14-slim, các gói pip fastapi, uvicorn và scikit-learn, rồi code app.py cùng file mô hình model.joblib. ' +
      'Lệnh docker run chạy image đó thành hai container, container 1 và container 2. ' +
      'Mỗi container dùng chung ba lớp của image và chỉ thêm ở trên cùng một lớp ghi tạm của riêng nó; lớp ghi mất khi xóa container, còn image không đổi.',
  },
  en: {
    description:
      'At the top is the image, read-only, made of three layers from the bottom up: the base image python:3.14-slim, the pip packages fastapi, uvicorn and scikit-learn, then the code app.py with the model file model.joblib. ' +
      'The docker run command runs that image as two containers, container 1 and container 2. ' +
      'Each container shares the three image layers and adds only a temporary write layer of its own on top; the write layer is lost when the container is removed, and the image does not change.',
  },
};
