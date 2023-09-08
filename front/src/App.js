import React from 'react';
import FileUpload from './components/FileUpload';

const App = () => {
  const handleUpload = (files) => {
    console.log('Arquivo selecionado:', files[0]);
  };

  return (
    <div className="App">
      <h1>Upload e Processamento de Arquivos</h1>
      <FileUpload onUpload={handleUpload} />
    </div>
  );
};

export default App;