import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      console.log("file name", file.name);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        name: file.name,
        fileUrl: file.ufsUrl,
        fileName: file.name
      };
    }),

  // Add a file uploader for documents and other files
  fileUploader: f({
    // Accept various file types
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    text: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      console.log("file name", file.name);

      // Return the file URL and name to the client
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        name: file.name,
        fileUrl: file.ufsUrl,
        fileName: file.name
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
