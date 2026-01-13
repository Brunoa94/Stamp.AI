import { useDropzone } from "react-dropzone";

interface IUseDropzoneConfigProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export const useDropzoneConfig = ({ onDrop }: IUseDropzoneConfigProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive,
  };
};
