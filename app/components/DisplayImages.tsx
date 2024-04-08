"use client"
import Image from 'next/image'
import { useState } from 'react'
import './DisplayImages.css'

interface Props {
  params: {
    selectedFiles: any
    setSelectedFiles: any
  }
}

interface File extends MediaSource {
  name: string
}

export default function DisplayImages({ params }: Props) {
  const { selectedFiles, setSelectedFiles } = params
  const [pickedFile, setPickedFile] = useState<File>({} as File)

  function removeFile() {
    setPickedFile({} as File)
    setSelectedFiles((prev: File[]) => {
      const newFiles = prev.filter((file: File) => file.name !== pickedFile.name)
      return newFiles
    })
  }

  return (
    <div className='container'>
      <div className='selectFiles'>
        <h3>Files: {selectedFiles.length}</h3>
        <select className='select'>
          {selectedFiles.map((file: File, index: any) => (
            <option key={index} onClick={() => setPickedFile(file)}>{file.name}</option>
          ))}
        </select>
      </div>
      { pickedFile.name && selectedFiles.length > 0 &&
        <div className='imageContainer'>
          <br />
          <Image
            src={ URL.createObjectURL(pickedFile)}
            alt={`Selected file`}
            width="0"
            height="0"
            sizes="100vw"
            className='showImage'
          />
          <button className='remove' onClick={removeFile}>Remove Image</button>
        </div>
      } 
    </div>
  )
}