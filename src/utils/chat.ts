import html2canvas from 'html2canvas';
import { ChatInterface, ContentInterface, isTextContent } from '@type/chat';

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace(/,/g, ' ');
};

// Function to convert HTML to an image using html2canvas
export const htmlToImg = async (html: HTMLDivElement) => {
  const needResize = window.innerWidth >= 1024;
  const initialWidth = html.style.width;
  if (needResize) {
    html.style.width = '1023px';
  }
  const canvas = await html2canvas(html);
  if (needResize) html.style.width = initialWidth;
  const dataURL = canvas.toDataURL('image/png');
  return dataURL;
};

// Function to download the image as a file
export const downloadImg = (imgData: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = imgData;
  link.download = fileName;
  link.click();
  link.remove();
};

// Function to convert a chat object to markdown format
export const chatToMarkdown = (chat: ChatInterface) => {
  let markdown = `# ${chat.title}\n\n`;
  chat.messages.forEach((message) => {
    markdown += `### **${message.role}**:\n\n${contentToMarkdown(message.content)}---\n\n`;
  });
  return markdown;
};

// Function to convert content objects to markdown format
export const contentToMarkdown = (contents: ContentInterface[]) => {
  let text = '';
  contents.forEach((content) => {
    text += isTextContent(content)? content.text: `![image](${content.image_url.url})`;
    text += "\n\n";
  })
  return text;
}

// Function to download the markdown content as a file
export const downloadMarkdown = (markdown: string, fileName: string) => {
  const link = document.createElement('a');
  const markdownFile = new Blob([markdown], { type: 'text/markdown' });
  link.href = URL.createObjectURL(markdownFile);
  link.download = fileName;
  link.click();
  link.remove();
};

export const preprocessLaTeX = (content: string) => {
  // Replace block-level LaTeX delimiters \[ \] with $$ $$

  const blockProcessedContent = content.replace(
    /\\\[(.*?)\\\]/gs,
    (_, equation) => `$$${equation}$$`
  );
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\((.*?)\\\)/gs,
    (_, equation) => `$${equation}$`
  );
  return inlineProcessedContent;
};