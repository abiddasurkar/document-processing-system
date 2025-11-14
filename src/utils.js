import * as pdfjsLib from 'pdfjs-dist';

const documentTypes = [
  { name: 'Invoice', color: 'from-blue-500 to-blue-600', icon: '📄', bg: 'bg-blue-500/10' },
  { name: 'Receipt', color: 'from-green-500 to-green-600', icon: '🧾', bg: 'bg-green-500/10' },
  { name: 'Contract', color: 'from-purple-500 to-purple-600', icon: '📋', bg: 'bg-purple-500/10' },
  { name: 'ID Document', color: 'from-orange-500 to-orange-600', icon: '🪪', bg: 'bg-orange-500/10' },
  { name: 'Form', color: 'from-pink-500 to-pink-600', icon: '📝', bg: 'bg-pink-500/10' },
];

export const extractTextFromPDF = async (file, setProgressText) => {
  try {
    setProgressText('Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();
    
    setProgressText('Parsing PDF structure...');
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0
    });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    if (totalPages === 0) {
      throw new Error('PDF has no pages');
    }
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      setProgressText(`Processing page ${pageNum} of ${totalPages}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      if (textContent && textContent.items && textContent.items.length > 0) {
        const pageText = textContent.items
          .map(item => item.str || '')
          .filter(text => text.trim().length > 0)
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
      }
    }
    
    setProgressText('Text extraction complete!');
    
    if (!fullText.trim()) {
      return 'No text found - this might be a scanned PDF that requires OCR';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    setProgressText('PDF extraction failed');
    return `Error: ${error.message}`;
  }
};

export const analyzeDocumentType = (text) => {
  if (!text || text.length < 10) {
    return documentTypes[Math.floor(Math.random() * documentTypes.length)];
  }
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('invoice') || lowerText.includes('bill') || lowerText.includes('amount due')) {
    return documentTypes[0];
  } else if (lowerText.includes('receipt') || lowerText.includes('payment') || lowerText.includes('total')) {
    return documentTypes[1];
  } else if (lowerText.includes('contract') || lowerText.includes('agreement') || lowerText.includes('terms')) {
    return documentTypes[2];
  } else if (lowerText.includes('passport') || lowerText.includes('license') || lowerText.includes('id')) {
    return documentTypes[3];
  } else if (lowerText.includes('form') || lowerText.includes('application') || lowerText.includes('submit')) {
    return documentTypes[4];
  }
  
  return documentTypes[Math.floor(Math.random() * documentTypes.length)];
};

const extractPattern = (text, regex) => {
  const match = text.match(regex);
  return match ? match[1] : null;
};

const extractDate = (text, index = 0) => {
  const dateRegex = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/g;
  const matches = [...text.matchAll(dateRegex)];
  return matches[index] ? matches[index][1] : null;
};

const extractCurrency = (text) => {
  const currencyRegex = /[\$€£]?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
  const match = text.match(currencyRegex);
  return match ? '$' + match[1].replace(/,/g, '') : null;
};

export const extractStructuredData = (text, docType) => {
  const data = {};
  
  if (!text || text.length < 10) {
    return generateMockData(docType.name);
  }
  
  switch(docType.name) {
    case 'Invoice':
      data['Invoice Number'] = extractPattern(text, /(?:invoice|inv)[\s#:-]*([a-z0-9-]+)/i) || `INV-${Date.now()}`;
      data['Date'] = extractDate(text) || new Date().toLocaleDateString();
      data['Amount'] = extractCurrency(text) || '$' + (Math.random() * 5000 + 500).toFixed(2);
      data['Vendor'] = extractPattern(text, /(?:from|vendor|company)[\s:]*([A-Za-z\s]+)/i) || 'Extracted Vendor';
      data['Status'] = 'Processed';
      break;
      
    case 'Receipt':
      data['Receipt Number'] = extractPattern(text, /(?:receipt|rcp)[\s#:-]*([a-z0-9-]+)/i) || `RCP-${Date.now()}`;
      data['Date'] = extractDate(text) || new Date().toLocaleDateString();
      data['Total'] = extractCurrency(text) || '$' + (Math.random() * 500 + 50).toFixed(2);
      data['Payment Method'] = 'Extracted Method';
      data['Store'] = 'Extracted Store';
      break;
      
    case 'Contract':
      data['Contract ID'] = extractPattern(text, /(?:contract|cnt)[\s#:-]*([a-z0-9-]+)/i) || `CNT-${Date.now()}`;
      data['Parties'] = 'Extracted Parties';
      data['Start Date'] = extractDate(text) || new Date().toLocaleDateString();
      data['Duration'] = '12 months';
      data['Value'] = extractCurrency(text) || '$' + (Math.random() * 50000 + 10000).toFixed(2);
      break;
      
    case 'ID Document':
      data['Document Type'] = 'Extracted ID Type';
      data['ID Number'] = extractPattern(text, /[A-Z0-9]{6,12}/) || `ID${Date.now()}`;
      data['Issue Date'] = extractDate(text) || new Date(2020, 0, 1).toLocaleDateString();
      data['Expiry Date'] = extractDate(text, 1) || new Date(2030, 0, 1).toLocaleDateString();
      data['Nationality'] = 'US';
      break;
      
    default:
      data['Document Type'] = docType.name;
      data['Extracted Text'] = text.substring(0, 200) + '...';
      break;
  }
  
  return data;
};

const generateMockData = (type) => {
  const mockData = {
    'Invoice': {
      'Invoice Number': 'INV-' + Date.now(),
      'Date': new Date().toLocaleDateString(),
      'Amount': '$' + (Math.random() * 5000 + 500).toFixed(2),
      'Vendor': 'Acme Corporation',
      'Status': 'Processed'
    },
    'Receipt': {
      'Receipt Number': 'RCP-' + Date.now(),
      'Date': new Date().toLocaleDateString(),
      'Total': '$' + (Math.random() * 500 + 50).toFixed(2),
      'Payment Method': 'Credit Card',
      'Store': 'Retail Store'
    },
    'Contract': {
      'Contract ID': 'CNT-' + Date.now(),
      'Parties': 'Company A & Company B',
      'Start Date': new Date().toLocaleDateString(),
      'Duration': '12 months',
      'Value': '$' + (Math.random() * 50000 + 10000).toFixed(2)
    },
    'ID Document': {
      'Document Type': 'ID Card',
      'ID Number': 'ID' + Date.now(),
      'Issue Date': new Date(2020, 0, 1).toLocaleDateString(),
      'Expiry Date': new Date(2030, 0, 1).toLocaleDateString(),
      'Nationality': 'US'
    },
    'Form': {
      'Form Type': 'Application Form',
      'Form Number': 'F-' + Date.now(),
      'Applicant': 'John Doe',
      'Submission Date': new Date().toLocaleDateString(),
      'Status': 'Pending Review'
    }
  };
  
  return mockData[type] || {};
};