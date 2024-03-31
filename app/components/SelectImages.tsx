interface Props {
  params: {
    selectedFiles: any
    setSelectedFiles: any
    imageRef: any
  }
}

export default function UploadImages({ params }: Props) {
  const { selectedFiles, setSelectedFiles, imageRef } = params 

  const handleFileChange = (event: { target: { files: any; }; }) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  return (
    <input 
      type="file" 
      onChange={handleFileChange} 
      accept='image/*, video/*'
      ref={imageRef}
      multiple 
    />
  );
}