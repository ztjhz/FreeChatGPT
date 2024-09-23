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

export const chatToMarkdown = (chat: ChatInterface): string => {
  let markdown = `# ${chat.title}\n\n`;
  let i = 0;

  while (i < chat.messages.length) {
    let message = chat.messages[i];
    let messageContent = contentToMarkdown(message.content);

    while (hasUnclosedCodeBlock(messageContent) && i + 1 < chat.messages.length && chat.messages[i + 1].role === message.role) {
      i++;
      messageContent += contentToMarkdown(chat.messages[i].content);
    }

    if (hasUnclosedCodeBlock(messageContent)) {
      // Close unclosed code block
      messageContent += '\n```\n';
    }

    markdown += `### **${message.role}**:\n\n${messageContent}---\n\n`;
    i++;
  }

  return markdown;
};

const contentToMarkdown = (contents: ContentInterface[]): string => {
  let text = '';
  contents.forEach((content) => {
    text += isTextContent(content) ? content.text : `![image](${content.image_url.url})`;
    text += "\n\n";
  });
  return text;
};

export const hasUnclosedCodeBlock = (text: string): boolean => {
  const codeBlockPattern = /```/g;
  const matches = text.match(codeBlockPattern);
  return matches ? matches.length % 2 !== 0 : false;
};

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
