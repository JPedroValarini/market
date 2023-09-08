import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

const FileUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null); // Estado para rastrear o arquivo selecionado

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]); // Armazena o arquivo selecionado no estado
    onUpload(acceptedFiles);
  }, [onUpload]);

  const processFile = () => {
    if (selectedFile) {
      // Implemente a lógica para processar o arquivo aqui
      // Envie o arquivo para o servidor (backend) para processamento
      console.log('Processando o arquivo:', selectedFile.name);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`dropzone-container ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Solte os arquivos aqui</p>
        ) : selectedFile ? (
          <p>Arquivo selecionado: {selectedFile.name}</p>
        ) : (
          <p>Arraste e solte arquivos aqui ou clique para fazer o upload</p>
        )}
      </div>
      {selectedFile && (
        <button onClick={processFile}>Processar Arquivo</button> // Botão para processar o arquivo
      )}
      <div>
        <input type="file" onChange={(e) => onUpload(e.target.files)} />
      </div>
    </div>
  );
};

export default FileUpload;
