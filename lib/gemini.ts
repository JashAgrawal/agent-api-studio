import { createPartFromUri, GoogleGenAI } from "@google/genai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY || ''});

export default genAI;

// Helper function to convert history format
function convertHistoryFormat(history: Array<{ role: string; content: string }>) {
  return history.map(msg => {
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }
  });
}

// Helper function to upload a file to Gemini
export async function uploadFileToGemini(fileUrl: string) {
  try {
    console.log(`Uploading file from URL: ${fileUrl}`);

    // Fetch the file from the URL
    const response = await fetch(fileUrl, {
      cache: 'no-store', // Ensure we're not getting a cached version
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log(`File fetched successfully. MIME type: ${blob.type}, Size: ${blob.size} bytes`);

    if (blob.size === 0) {
      throw new Error('File is empty (0 bytes)');
    }

    // Convert blob to File object
    const fileName = fileUrl.split('/').pop() || 'uploaded-file';
    const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });

    // Upload the file to Gemini
    console.log(`Uploading file to Gemini: ${fileName} (${file.type}), size: ${file.size} bytes`);

    // Debug: Log the file object
    console.log('File object:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    const uploadedFile = await genAI.files.upload({
      file,
    });

    console.log(`File uploaded successfully to Gemini. URI: ${uploadedFile.uri}, MIME type: ${uploadedFile.mimeType}`);
    return uploadedFile;
  } catch (error) {
    console.error('Error uploading file to Gemini:', error);
    throw error;
  }
}

// Helper function to generate text
export async function generateGeminiText({
  prompt,
  system,
  temperature = 0.7,
  maxTokens = 1000,
  history = [],
  fileUrl,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  history?: Array<{ role: string; content: string }>;
  fileUrl?: string;
}) {
  console.log({
    prompt,
    system,
    temperature,
    maxTokens,
    history,
    fileUrl,
  });

  // Create a chat session
  const chat = genAI.chats.create({
    model: 'gemini-1.5-pro',
    config: {
      systemInstruction: system,
      temperature,
      maxOutputTokens: maxTokens,
    },
    history: convertHistoryFormat(history),
  });

  // If a file URL is provided, upload it to Gemini and include it in the message
  if (fileUrl) {
    try {
      console.log(`Processing file for Gemini: ${fileUrl}`);

      // Upload the file to Gemini
      const geminiFile = await uploadFileToGemini(fileUrl);

      if (!geminiFile.uri) {
        throw new Error('File upload succeeded but no URI was returned');
      }

      console.log(`Creating message with file. URI: ${geminiFile.uri}, MIME: ${geminiFile.mimeType}`);

      // Create a message with both text and file
      const messageParts = [
        { text: prompt },
        createPartFromUri(geminiFile.uri, geminiFile.mimeType || 'application/octet-stream')
      ];

      console.log('Sending message with file to Gemini:', JSON.stringify(messageParts, null, 2));

      const response = await chat.sendMessage({
        message: messageParts,
      });

      console.log('Received response from Gemini with file');

      return {
        text: response.text,
        response,
      };
    } catch (error) {
      console.error('Error processing file for Gemini:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));

      // Fall back to text-only if file processing fails
      console.log('Falling back to text-only message');
      const response = await chat.sendMessage({
        message: prompt + " (Note: File upload failed - " + (error instanceof Error ? error.message : String(error)) + ")",
      });

      return {
        text: response.text,
        response,
      };
    }
  } else {
    // Send text-only message
    console.log('Sending text-only message to Gemini');
    const response = await chat.sendMessage({
      message: prompt,
    });

    return {
      text: response.text,
      response,
    };
  }
}

// Helper function to stream text
export async function streamGeminiText({
  prompt,
  system,
  temperature = 0.7,
  maxTokens = 1000,
  history = [],
  fileUrl,
  onChunk,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  history?: Array<{ role: string; content: string }>;
  fileUrl?: string;
  onChunk: (chunk: { text: string }) => void;
}) {
  // Create a chat session
  const chat = genAI.chats.create({
    model: 'gemini-1.5-pro',
    config: {
      systemInstruction: system,
      temperature,
      maxOutputTokens: maxTokens,
    },
    history: convertHistoryFormat(history),
  });

  let stream;

  // If a file URL is provided, upload it to Gemini and include it in the message
  if (fileUrl) {
    try {
      console.log(`Processing file for streaming: ${fileUrl}`);

      // Upload the file to Gemini
      const geminiFile = await uploadFileToGemini(fileUrl);

      if (!geminiFile.uri) {
        throw new Error('File upload succeeded but no URI was returned');
      }

      console.log(`Creating message with file for streaming. URI: ${geminiFile.uri}, MIME: ${geminiFile.mimeType}`);

      // Create a message with both text and file
      const messageParts = [
        { text: prompt },
        createPartFromUri(geminiFile.uri, geminiFile.mimeType || 'application/octet-stream')
      ];

      console.log('Sending message with file to Gemini for streaming:', JSON.stringify(messageParts, null, 2));

      // For streaming with files, we need to use the regular message API
      // and then stream the response manually
      const response = await chat.sendMessage({
        message: messageParts,
      });

      console.log(`Got response with file. Creating mock stream. Response text length: ${response.text?.length || 0}`);

      // Create a mock stream that returns the full response
      stream = {
        async *[Symbol.asyncIterator]() {
          yield { text: response.text || "" };
        }
      };
    } catch (error) {
      console.error('Error processing file for Gemini streaming:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));

      // Fall back to text-only if file processing fails
      console.log('Falling back to text-only message for streaming');
      stream = await chat.sendMessageStream({
        message: prompt + " (Note: File upload failed: " + (error instanceof Error ? error.message : String(error)) + ")",
      });
    }
  } else {
    // Send text-only message as a stream
    console.log('Sending text-only message to Gemini as stream');
    stream = await chat.sendMessageStream({
      message: prompt,
    });
  }

  let fullText = '';

  // Process each chunk in the stream
  for await (const chunk of stream) {
    const chunkText = chunk.text;
    fullText += chunkText;
    onChunk({ text: chunkText??"" });
  }

  return {
    text: fullText,
  };
}