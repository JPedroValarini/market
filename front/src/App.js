import React from 'react';
import FileUpload from './components/FileUpload';

const App = () => {
  const handleUpload = (file) => {
    console.log('Arquivo selecionado:', file.name);
  };

  return (
    <div className="App">
      <h1>Upload e Processamento de Arquivos</h1>
      <FileUpload onUpload={handleUpload} />
    </div>
  );
};

export default App;
