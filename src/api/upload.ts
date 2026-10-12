import { api } from './client';
import * as S from './schemas/upload';
import type { UploadPurpose } from './types';

export interface PresignedUpload {
  uploadUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}

export async function requestPresignedUpload(
  purpose: UploadPurpose,
  contentType: string,
  contentLength: number,
): Promise<PresignedUpload> {
  const extension = contentType.split('/')[1];
  const res = await api().request(S.PresignedUploadResponse, {
    method: 'POST',
    path: '/upload/presigned',
    body: { purpose, contentType, contentLength, extension },
  });
  const objectKey = res.data.objectKey ?? res.data.fileKey;
  if (!objectKey) throw new Error('Presigned upload response missing object key');
  return { uploadUrl: res.data.uploadUrl, objectKey, expiresInSeconds: res.data.expiresIn ?? 900 };
}

export async function requestPresignedView(
  objectKey: string,
): Promise<{ url: string; expiresInSeconds: number }> {
  const res = await api().request(S.PresignedViewResponse, {
    path: '/upload/presigned-view',
    query: { objectKey },
  });
  return { url: res.data.viewUrl, expiresInSeconds: res.data.expiresIn ?? 3600 };
}

/** PUTs raw bytes to the presigned URL with progress; uses XHR because fetch has no upload progress in RN. */
export function putToPresignedUrl(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));
    signal?.addEventListener('abort', () => xhr.abort());
    (xhr as unknown as { send(body: unknown): void }).send({
      uri: fileUri,
      type: contentType,
      name: 'upload',
    });
  });
}

export async function uploadStatus() {
  const res = await api().request(S.UploadStatusResponse, { path: '/upload/status', auth: false });
  return res.data;
}
