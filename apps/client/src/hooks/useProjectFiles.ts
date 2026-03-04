"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  ApiProjectFile,
  PresignUploadResponse,
  PresignDownloadResponse,
} from "@/lib/api-types";
import api from "@/lib/api";

export function useProjectFiles(projectId: string | null) {
  const enabled = Boolean(projectId);

  const { data: files = [], isLoading } = useQuery<ApiProjectFile[]>({
    queryKey: queryKeys.projectFiles(projectId ?? ""),
    queryFn: async () => {
      const res = await api.get<ApiProjectFile[]>(
        `/projects/${projectId}/files`,
      );
      return res.data;
    },
    enabled,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const presignRes = await api.post<PresignUploadResponse>(
        `/projects/${projectId}/files/presign-upload`,
        {
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        },
      );

      await fetch(presignRes.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return presignRes.data.file;
    },
    onSuccess: (newFile) => {
      queryClient.setQueryData<ApiProjectFile[]>(
        queryKeys.projectFiles(projectId ?? ""),
        (old = []) => [...old, newFile],
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectFiles(projectId ?? ""),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) =>
      api.delete(`/projects/${projectId}/files/${fileId}`),
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projectFiles(projectId ?? ""),
      });
      const snapshot = queryClient.getQueryData<ApiProjectFile[]>(
        queryKeys.projectFiles(projectId ?? ""),
      );
      queryClient.setQueryData<ApiProjectFile[]>(
        queryKeys.projectFiles(projectId ?? ""),
        (old = []) => old.filter((f) => f.id !== fileId),
      );
      return { snapshot };
    },
    onError: (_, __, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(
          queryKeys.projectFiles(projectId ?? ""),
          ctx.snapshot,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectFiles(projectId ?? ""),
      });
    },
  });

  async function getDownloadUrl(fileId: string): Promise<string> {
    const res = await api.get<PresignDownloadResponse>(
      `/projects/${projectId}/files/${fileId}/presign-download`,
    );
    return res.data.downloadUrl;
  }

  function uploadFiles(fileList: File[]) {
    fileList.forEach((file) => uploadMutation.mutate(file));
  }

  function deleteFile(fileId: string) {
    deleteMutation.mutate(fileId);
  }

  return {
    files,
    isLoading,
    isUploading: uploadMutation.isPending,
    uploadFiles,
    deleteFile,
    getDownloadUrl,
  };
}
