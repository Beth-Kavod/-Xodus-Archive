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
    <>
    <label htmlFor="fileSelect" style={{ wordBreak: 'keep-all' }}>Upload:</label>
    <input 
      type="file" 
      onChange={handleFileChange} 
      accept='image/*, video/*'
      ref={imageRef}
      value=""
      id="fileSelect"
      style={{ width: 200 }}
      multiple 
    />
    </>
  );
}