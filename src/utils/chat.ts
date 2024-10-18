import html2canvas from 'html2canvas';
import { ChatInterface } from '@type/chat';

// Function to convert HTML to an image using html2canvas
export const htmlToImg = async (html: HTMLDivElement) => {
  const needResize = window.innerWidth >= 1024;
  const initialWidth = html.style.width;
  if (needResize) {
    html.style.width = '1023px';
  }
  await Promise.all(
    Array.from(html.querySelectorAll('img'))
      .filter(img => !img.complete)
      .map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))
  );
  const canvas = await html2canvas(html, {
    useCORS: true,
    allowTaint: true,
  });
  if (needResize) html.style.width = initialWidth;
  const croppedCanvas = document.createElement('canvas');
  const ctx = croppedCanvas.getContext('2d');
  if (ctx) {
    const cropHeight = 3;
    const cropWidth = 3;
    croppedCanvas.width = canvas.width - cropWidth;
    croppedCanvas.height = canvas.height - cropHeight;
    ctx.drawImage(
      canvas,
      0, 0,
      canvas.width - cropWidth, canvas.height - cropHeight,
      0, 0,
      canvas.width - cropWidth, canvas.height - cropHeight
    );
  const dataURL = croppedCanvas.toDataURL('image/png');
  return dataURL;
  } else {
    const dataURL = canvas.toDataURL('image/png');
    return dataURL;
  }
};

// Function to download the image as a file
export const downloadImg = (imgData: string, fileName: string) => {
  const byteString = atob(imgData.split(',')[1]);
  const mimeString = 'image/png';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  fileName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  link.download = fileName;

  document.body.appendChild(link);
  const event = new MouseEvent('click');
  link.dispatchEvent(event);
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};


// Function to convert a chat object to markdown format
export const chatToMarkdown = (chat: ChatInterface) => {
  let markdown = `# ${chat.title}\n\n`;
  chat.messages.forEach((message) => {
    markdown += `### **${message.role}**:\n\n${message.content}\n\n---\n\n`;
  });
  return markdown;
};

// Function to download the markdown content as a file
export const downloadMarkdown = (markdown: string, fileName: string) => {
  const link = document.createElement('a');
  const markdownFile = new Blob([markdown], { type: 'text/markdown' });
  link.href = URL.createObjectURL(markdownFile);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
