import React, { memo, useEffect, useState, useRef, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';

import useSubmit from '@hooks/useSubmit';

import {
  ChatInterface,
  ContentInterface,
  ImageContentInterface,
  ModelOptions,
  TextContentInterface,
} from '@type/chat';

import PopupModal from '@components/PopupModal';
import TokenCount from '@components/TokenCount';
import CommandPrompt from '../CommandPrompt';
import { defaultModel, modelTypes } from '@constants/chat';
import AttachmentIcon from '@icon/AttachmentIcon';

const EditView = ({
  content: content,
  setIsEdit,
  messageIndex,
  sticky,
}: {
  content: ContentInterface[];
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  messageIndex: number;
  sticky?: boolean;
}) => {
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const inputRole = useStore((state) => state.inputRole);
  const setChats = useStore((state) => state.setChats);
  var currentChatIndex = useStore((state) => state.currentChatIndex);
  const model = useStore((state) => {
    const isInitialised =
      state.chats && state.chats.length > 0 && state.currentChatIndex >= 0 && state.currentChatIndex < state.chats.length;
    if (!isInitialised) {
      currentChatIndex = 0
      setCurrentChatIndex(0)
    }
    return isInitialised
      ? state.chats![state.currentChatIndex].config.model
      : defaultModel;
  });

  const [_content, _setContent] = useState<ContentInterface[]>(content);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const textareaRef = React.createRef<HTMLTextAreaElement>();

  const { t } = useTranslation();

  const resetTextAreaHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|playbook|silk/i.test(
        navigator.userAgent
      );

    if (e.key === 'Enter' && !isMobile && !e.nativeEvent.isComposing) {
      const enterToSubmit = useStore.getState().enterToSubmit;

      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        handleGenerate();
        resetTextAreaHeight();
      } else if (
        (enterToSubmit && !e.shiftKey) ||
        (!enterToSubmit && (e.ctrlKey || e.shiftKey))
      ) {
        if (sticky) {
          e.preventDefault();
          handleGenerate();
          resetTextAreaHeight();
        } else {
          handleSave();
        }
      }
    }
  };

  // convert message blob urls to base64
  const blobToBase64 = async (blob: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files!;
    const newImageURLs = Array.from(files).map((file: Blob) =>
      URL.createObjectURL(file)
    );
    const newImages = await Promise.all(
      newImageURLs.map(async (url) => {
        const blob = await fetch(url).then((r) => r.blob());
        return {
          type: 'image_url',
          image_url: {
            detail: 'auto',
            url: (await blobToBase64(blob)) as string,
          },
        } as ImageContentInterface;
      })
    );
    const updatedContent = [..._content, ...newImages];

    _setContent(updatedContent);
  };

  const handleImageUrlChange = () => {
    if (imageUrl.trim() === '') return;

    const newImage: ImageContentInterface = {
      type: 'image_url',
      image_url: {
        detail: 'auto',
        url: imageUrl,
      },
    };

    const updatedContent = [..._content, newImage];
    _setContent(updatedContent);
    setImageUrl('');
  };

  const handleImageDetailChange = (index: number, detail: string) => {
    const updatedImages = [..._content];
    updatedImages[index + 1].image_url.detail = detail;
    _setContent(updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [..._content];
    updatedImages.splice(index + 1, 1);

    _setContent(updatedImages);
  };

  const handleSave = () => {
    if (
      sticky &&
      ((_content[0] as TextContentInterface).text === '' ||
        useStore.getState().generating)
    )
      return;
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    const updatedMessages = updatedChats[currentChatIndex].messages;

    if (sticky) {
      updatedMessages.push({ role: inputRole, content: _content });
      _setContent([
        {
          type: 'text',
          text: '',
        } as TextContentInterface,
      ]);
      resetTextAreaHeight();
    } else {
      updatedMessages[messageIndex].content = _content;
      setIsEdit(false);
    }
    setChats(updatedChats);
  };

  const { handleSubmit } = useSubmit();
  const handleGenerate = () => {
    if (useStore.getState().generating) return;
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    const updatedMessages = updatedChats[currentChatIndex].messages;

    if (sticky) {
      if ((_content[0] as TextContentInterface).text !== '') {
        updatedMessages.push({ role: inputRole, content: _content });
      }
      _setContent([
        {
          type: 'text',
          text: '',
        } as TextContentInterface,
      ]);
      resetTextAreaHeight();
    } else {
      updatedMessages[messageIndex].content = _content;
      updatedChats[currentChatIndex].messages = updatedMessages.slice(
        0,
        messageIndex + 1
      );
      setIsEdit(false);
    }
    try {
      setChats(updatedChats);
    } catch (e) {
      console.log(e);
    }
    handleSubmit();
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          const base64Image = (await blobToBase64(blob)) as string;
          const newImage: ImageContentInterface = {
            type: 'image_url',
            image_url: {
              detail: 'auto',
              url: base64Image,
            },
          };
          const updatedContent = [..._content, newImage];
          _setContent(updatedContent);
        }
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [(_content[0] as TextContentInterface).text]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const fileInputRef = useRef(null);
  const handleUploadButtonClick = () => {
    // Trigger the file input when the custom button is clicked
    (fileInputRef.current! as HTMLInputElement).click();
  };
  return (
    <div className='relative'>
      <div
        className={`w-full  ${
          sticky
            ? 'py-2 md:py-3 px-2 md:px-4 border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]'
            : ''
        }`}
      >
        <div className='relative flex items-start'>
          {modelTypes[model] == 'image' && (
            <>
              <button
                className='absolute left-0 bottom-0  btn btn-secondary h-10 ml-[-1.2rem] mb-[-0.4rem]'
                onClick={handleUploadButtonClick}
                aria-label={'Upload Images'}
              >
                <div className='flex items-center justify-center gap-2'>
                  <AttachmentIcon />
                </div>
              </button>
            </>
          )}
          {/* Place the AttachmentIcon directly over the textarea */}
          <textarea
            ref={textareaRef}
            className={`m-0 resize-none rounded-lg bg-transparent overflow-y-hidden focus:ring-0 focus-visible:ring-0 leading-7 w-full placeholder:text-gray-500/40 pr-10 ${modelTypes[model] == 'image' ? 'pl-7' : ''}`} // Adjust padding-right to make space for the icon
            onChange={(e) => {
              _setContent((prev) => [
                { type: 'text', text: e.target.value },
                ...prev.slice(1),
              ]);
            }}
            value={(_content[0] as TextContentInterface).text}
            placeholder={t('submitPlaceholder') as string}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
          ></textarea>
        </div>
      </div>
      <EditViewButtons
        sticky={sticky}
        handleFileChange={handleFileChange}
        handleImageDetailChange={handleImageDetailChange}
        handleRemoveImage={handleRemoveImage}
        handleGenerate={handleGenerate}
        handleSave={handleSave}
        setIsModalOpen={setIsModalOpen}
        setIsEdit={setIsEdit}
        _setContent={_setContent}
        _content={_content}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        handleImageUrlChange={handleImageUrlChange}
        fileInputRef={fileInputRef}
        model={model}
      />
      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title={t('warning') as string}
          message={t('clearMessageWarning') as string}
          handleConfirm={handleGenerate}
        />
      )}
    </div>
  );
};

const EditViewButtons = memo(
  ({
    sticky = false,
    handleFileChange,
    handleImageDetailChange,
    handleRemoveImage,
    handleGenerate,
    handleSave,
    setIsModalOpen,
    setIsEdit,
    _setContent,
    _content,
    imageUrl,
    setImageUrl,
    handleImageUrlChange,
    fileInputRef,
    model,
  }: {
    sticky?: boolean;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageDetailChange: (index: number, e: string) => void;
    handleRemoveImage: (index: number) => void;
    handleGenerate: () => void;
    handleSave: () => void;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    _setContent: React.Dispatch<React.SetStateAction<ContentInterface[]>>;
    _content: ContentInterface[];
    imageUrl: string;
    setImageUrl: React.Dispatch<React.SetStateAction<string>>;
    handleImageUrlChange: () => void;
    fileInputRef: React.MutableRefObject<null>;
    model: ModelOptions;
  }) => {
    const { t } = useTranslation();
    const generating = useStore.getState().generating;
    const advancedMode = useStore((state) => state.advancedMode);

    return (
      <div>
        {modelTypes[model] == 'image' && (
          <>
            <div className='flex justify-center'>
              <div className='flex gap-5'>
                {_content.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className='image-container flex flex-col gap-2'
                  >
                    <img
                      src={image.image_url.url}
                      alt={`uploaded-${index}`}
                      className='h-10'
                    />
                    <div className='flex flex-row gap-3'>
                      <select
                        onChange={(event) =>
                          handleImageDetailChange(index, event.target.value)
                        }
                        title='Select image resolution'
                        aria-label='Select image resolution'
                        defaultValue={image.image_url.detail}
                        style={{ color: 'black' }}
                      >
                        <option value='auto'>Auto</option>
                        <option value='high'>High</option>
                        <option value='low'>Low</option>
                      </select>
                      <button
                        className='close-button'
                        onClick={() => handleRemoveImage(index)}
                        aria-label='Remove Image'
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex justify-center mt-4'>
              <input
                type='text'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t('enter_image_url_placeholder') as string}
                className='input input-bordered w-full max-w-xs text-gray-800 dark:text-white p-3  border-none bg-gray-200 dark:bg-gray-600 rounded-md m-0 w-full mr-0 h-10 focus:outline-none'
              />
              <button
                className='btn btn-neutral ml-2'
                onClick={handleImageUrlChange}
                aria-label={t('add_image_url') as string}
              >
                {t('add_image_url')}
              </button>
            </div>
            {/* Hidden file input */}
            <input
              type='file'
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
            />
          </>
        )}

        <div className='flex'>
          <div className='flex-1 text-center mt-2 flex justify-center'>
            {sticky && (
              <button
                className={`btn relative mr-2 btn-primary ${
                  generating ? 'cursor-not-allowed opacity-40' : ''
                }`}
                onClick={handleGenerate}
                aria-label={t('generate') as string}
              >
                <div className='flex items-center justify-center gap-2'>
                  {t('generate')}
                </div>
              </button>
            )}

            {sticky || (
              <button
                className='btn relative mr-2 btn-primary'
                onClick={() => {
                  !generating && setIsModalOpen(true);
                }}
              >
                <div className='flex items-center justify-center gap-2'>
                  {t('generate')}
                </div>
              </button>
            )}

            <button
              className={`btn relative mr-2 ${
                sticky
                  ? `btn-neutral ${
                      generating ? 'cursor-not-allowed opacity-40' : ''
                    }`
                  : 'btn-neutral'
              }`}
              onClick={handleSave}
              aria-label={t('save') as string}
            >
              <div className='flex items-center justify-center gap-2'>
                {t('save')}
              </div>
            </button>

            {sticky || (
              <button
                className='btn relative btn-neutral'
                onClick={() => setIsEdit(false)}
                aria-label={t('cancel') as string}
              >
                <div className='flex items-center justify-center gap-2'>
                  {t('cancel')}
                </div>
              </button>
            )}
          </div>
          {sticky && advancedMode && <TokenCount />}
          <CommandPrompt _setContent={_setContent} />
        </div>
      </div>
    );
  }
);

export default EditView;
