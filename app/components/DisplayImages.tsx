"use client"
import Image from 'next/image'
import { useState } from 'react'

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
    <div style={{ width: "100%"}}>
      <div style={{ width: "100%", display: 'flex', justifyContent: 'space-between'}}>
        <h3>Selected Files: {selectedFiles.length}</h3>
        <select>
          {selectedFiles.map((file: File, index: any) => (
            <option key={index} onClick={() => setPickedFile(file)}>{file.name}</option>
          ))}
        </select>
      </div>
      { pickedFile.name && 
        <>
          <br />
          <Image
            src={URL.createObjectURL(pickedFile)}
            alt={`Selected file`}
            width="0"
            height="0"
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
          />
          <button onClick={removeFile}>Remove</button>
        </>
      } 
    </div>
  )
}

{/* <Image 
            key={index}
            width={400}
            height={400}
            src={URL.createObjectURL(file)}
            alt={`Selected file ${index + 1}`}
          /> */}