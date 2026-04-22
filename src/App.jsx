import React, { useState } from 'react';
import UploadPane from './components/UploadPane';
import ChatPane from './components/ChatPane';

function App() {
  const [uploadState, setUploadState] = useState('idle'); // idle, embedding, vectorizing, done
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'System initialized. Awaiting context injection.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleUploadProgress = async (file) => {
    setUploadState('embedding');
    
    try {
      setUploadState('vectorizing');
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('https://dishen41-try-5.hf.space/upload/', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error(`Upload server error: ${uploadRes.status}`);
      
      const uploadData = await uploadRes.json();
      if (uploadData.error) throw new Error(uploadData.error);
      
      setUploadState('done');

      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Context established from ${file.name}. Dimensions synchronized. How may I assist with this data?`
      }]);
      
      setTimeout(() => {
        setUploadState('idle');
        setUploadedFiles(prev => [...prev, file]);
      }, 3000);
    } catch (err) {
      console.error('Upload failed', err);
      setUploadState('idle');
      setMessages(prev => [...prev, { role: 'ai', content: `Neural interface warning: Backend upload failed. Reason: ${err.message}` }]);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setMessages(prev => [...prev, { role: 'ai', content: 'Context layer severed. Re-calibrating neural weights.' }]);
  };

  const handleSendMessage = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    
    try {
      const askFormData = new FormData();
      askFormData.append("question", text);
      const res = await fetch('https://dishen41-try-5.hf.space/ask/', { 
        method: 'POST', 
        body: askFormData
      });
      
      if (!res.ok) throw new Error('Query server error');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.answer || "Neural link returned empty response.",
        docs: data.chunks || []
      }]);
    } catch (err) {
      console.error('Query failed', err);
      setMessages(prev => [...prev, { role: 'ai', content: `Connection timed out or failed. Reason: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden font-sans bg-dark-bg text-slate-200">
      <div className="w-full md:w-1/3 md:min-w-[320px] md:max-w-[450px] z-10 shrink-0 max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-visible">
        <UploadPane 
          onUploadProgress={handleUploadProgress} 
          uploadState={uploadState} 
          uploadedFiles={uploadedFiles}
          onRemoveFile={handleRemoveFile}
        />
      </div>
      <div className="flex-1 flex flex-col z-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        <ChatPane messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} />
      </div>
    </div>
  );
}

export default App;
