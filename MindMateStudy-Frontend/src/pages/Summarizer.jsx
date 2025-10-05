import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import pdfToText from 'react-pdftotext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCloudUploadAlt, 
  FaExclamationTriangle, 
  FaExpand,
  FaRobot,
  FaFilePdf,
  FaImage,
  FaDownload,
  FaMagic,
  FaRegClock,
  FaCheckCircle
} from 'react-icons/fa';
import { FiUpload, FiX, FiCopy, FiBook } from 'react-icons/fi';
import axiosInstance from '../config/axiosConfig';
import { Link } from 'react-router-dom';

function Summarizer() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState('');
  const [fullImage, setFullImage] = useState(null);
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // upload, text
  const [customText, setCustomText] = useState('');
  const [processingStage, setProcessingStage] = useState(''); // extracting, summarizing, complete
  const [fileInfo, setFileInfo] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    document.title = 'NotesBuddy - AI Summarizer';
    return () => {
      if (preview && typeof preview === 'string') {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetStates = () => {
    setError('');
    setText('');
    setSummary('');
    setPreview(null);
    setFullImage(null);
    setFileType('');
    setFileInfo(null);
    setIsSaved(false);
    setProcessingStage('');
  };

  const handlePdf = async (file) => {
    try {
      setProcessingStage('extracting');
      const text = await pdfToText(file);
      setText(text);
      await summarizeText(text);
    } catch (error) {
      console.error(error);
      setError('Error processing the PDF. Please try again.');
      setLoading(false);
    }
  };

  const handleImage = async (file) => {
    try {
      setProcessingStage('extracting');
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });
      const text = result.data.text;
      setText(text);
      await summarizeText(text);
    } catch (error) {
      console.error(error);
      setError('Error processing the image. Please try again.');
      setLoading(false);
    }
  };

  const summarizeText = async (inputText) => {
    try {
      setProcessingStage('summarizing');
      const response = await axiosInstance.post('/chat/summarize', { prompt: inputText });
      if (response.data.status) {
        setTitle(response.data.title?.trim());
        setSummary(response.data.summary.replaceAll('*', '').trim());
        setProcessingStage('complete');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setError('Error summarizing the text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTextSummarize = () => {
    if (!customText.trim()) {
      setError('Please enter some text to summarize');
      return;
    }
    setLoading(true);
    resetStates();
    summarizeText(customText);
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    resetStates();
    setLoading(true);
    setFileInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type
    });

    const type = file.type;
    setFileType(type);

    if (type === 'application/pdf') {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      handlePdf(file);
    } else if (type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      handleImage(file);
    } else {
      setError('Unsupported file format. Please upload a PDF or an image.');
      setLoading(false);
    }
  };

  const handlePaste = useCallback((event) => {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) onDrop([blob]);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0,0);
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const saveNote = async () => {
    try {
      const response = await axiosInstance.post('/chat/save-note', {
        title: title || `Summary - ${new Date().toLocaleDateString()}`,
        summary: summary,
        type: 'text'
      });
      
      if (response.data.note) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    // You can add a toast notification here
  };

  const downloadNote = () => {
    const element = document.createElement('a');
    const file = new Blob([`# ${title}\n\n${summary}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/50 to-gray-900/80"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaRobot className="text-4xl text-cyan-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              NotesBuddy Summarizer
            </h1>
          </div>
          <p className="text-gray-300 text-lg">AI-powered text extraction and smart summarization</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/notes"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg flex items-center"
          >
            <FiBook className="mr-2" />
            View Saved Notes
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-1 border border-gray-700/30">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 rounded-xl transition-all flex items-center ${
                activeTab === 'upload' 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiUpload className="mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-6 py-2 rounded-xl transition-all flex items-center ${
                activeTab === 'text' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiBook className="mr-2" />
              Paste Text
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          /* File Upload Section */
          <motion.div
            {...getRootProps()}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/30 p-8 cursor-pointer backdrop-blur-lg hover:border-cyan-400/50 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <input {...getInputProps()} />
            <div className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-600 bg-gray-800/30'
            }`}>
              <FaCloudUploadAlt className="text-5xl text-cyan-400 mb-4" />
              <p className="text-xl text-white mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop PDF/image or click to browse'}
              </p>
              <p className="text-gray-400">Supports OCR and PDF text extraction</p>
              <div className="flex space-x-4 mt-4">
                <div className="flex items-center text-gray-400">
                  <FaFilePdf className="mr-1" /> PDF
                </div>
                <div className="flex items-center text-gray-400">
                  <FaImage className="mr-1" /> Images
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Text Input Section */
          <motion.div
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/30 p-8 backdrop-blur-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your text here for AI summarization..."
              className="w-full h-48 bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-none"
            />
            <button
              onClick={handleCustomTextSummarize}
              disabled={!customText.trim()}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-cyan-700"
            >
              <FaMagic className="inline mr-2" />
              Summarize Text
            </button>
          </motion.div>
        )}

        {/* File Preview */}
        <AnimatePresence>
          {preview && fileInfo && (
            <motion.div
              className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/30 shadow-xl backdrop-blur-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {fileType === 'application/pdf' ? (
                    <FaFilePdf className="text-3xl text-red-400 mr-3" />
                  ) : (
                    <FaImage className="text-3xl text-green-400 mr-3" />
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{fileInfo.name}</h3>
                    <p className="text-gray-400 text-sm">{fileInfo.size} MB • {fileType.split('/')[1]?.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFullImage(preview)}
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <FaExpand />
                </button>
              </div>
              
              {fileType.startsWith('image/') && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-xl object-contain w-full cursor-pointer"
                  onClick={() => setFullImage(preview)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-6 bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center backdrop-blur-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FaExclamationTriangle className="mr-3 flex-shrink-0" />
              <p className="flex-1">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-300 hover:text-white transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 text-center backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <FaRobot className="text-4xl text-cyan-400 animate-bounce mb-4" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  {processingStage === 'extracting' ? 'Extracting Text...' :
                   processingStage === 'summarizing' ? 'AI is Summarizing...' :
                   'Processing...'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {processingStage === 'extracting' ? 'Using OCR to extract text from your file' :
                   processingStage === 'summarizing' ? 'Generating smart summary with AI' :
                   'Analyzing your content...'}
                </p>
                <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: processingStage === 'extracting' ? '50%' : processingStage === 'summarizing' ? '100%' : '30%' }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Result */}
        <AnimatePresence>
          {summary && (
            <motion.div
              className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/30 p-8 backdrop-blur-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header with Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                  )}
                  <div className="flex items-center text-gray-400 text-sm">
                    <FaRegClock className="mr-1" />
                    Generated just now • {summary.split(' ').length} words
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-xl transition-colors"
                    title="Copy to clipboard"
                  >
                    <FiCopy />
                  </button>
                  <button
                    onClick={downloadNote}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-xl transition-colors"
                    title="Download note"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={saveNote}
                    disabled={isSaved}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center"
                  >
                    {isSaved ? <FaCheckCircle className="mr-2" /> : <FiBook className="mr-2" />}
                    {isSaved ? 'Saved!' : 'Save Note'}
                  </button>
                </div>
              </div>

              {/* Summary Content */}
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg font-sans bg-gray-800/30 rounded-xl p-6">
                  {summary.split('').map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.005 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Image Modal */}
        <AnimatePresence>
          {fullImage && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex justify-center items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative bg-gray-900 rounded-3xl max-w-4xl max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <img
                  src={fullImage}
                  alt="Full Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setFullImage(null)}
                  className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Summarizer;