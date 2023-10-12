import React, { useContext, useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { LoadingFile } from "./utils/LoadingFile";
import type { ReaderProps } from "./types";
import { View } from "./View";
import { useInjectWebVieWVariables } from "./hooks/useInjectWebviewVariables";
import { ReaderContext, defaultTheme as initialTheme } from "./context";
import { isURL } from "./utils/isURL";
import { getSourceType } from "./utils/getSourceType";
import { getSourceName } from "./utils/getPathname";
import { SourceType } from "./utils/enums/source-type.enum";
import { isFsUri } from "./utils/isFsUri";
import foliate from "./foliate";
import pdf from "./pdf";
import pdfWorker from "./pdfWorker";

// ...
export function Reader({
  src,
  width,
  height,
  initialLocations,
  initialLocation,
  renderLoadingFileComponent = (props) => (
    <LoadingFile {...props} width={width} height={height} />
  ),
  fileSystem: useFileSystem,
  ...rest
}: ReaderProps) {
  const {
    downloadFile,
    size: fileSize,
    progress: downloadProgress,
    success: downloadSuccess,
    error: downloadError,
  } = useFileSystem();

  const { setIsLoading, isLoading } = useContext(ReaderContext);
  const { injectWebVieWVariables } = useInjectWebVieWVariables();
  const [template, setTemplate] = useState<string | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [allowedUris, setAllowedUris] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      const foliateFileUri = `${FileSystem.documentDirectory}foliate.js`;
      const pdfFileUri = `${FileSystem.documentDirectory}pdf.js`;
      const pdfWorkerUri = `${FileSystem.documentDirectory}pdf.worker.js`;

      try {
        await FileSystem.writeAsStringAsync(pdfFileUri, pdf);
      } catch (e) {
        throw new Error("failed to write pdf js file");
      }

      try {
        await FileSystem.writeAsStringAsync(pdfWorkerUri, pdfWorker);
      } catch (e) {
        throw new Error("failed to write pdf js file");
      }

      try {
        await FileSystem.writeAsStringAsync(foliateFileUri, foliate);
      } catch (e) {
        throw new Error("failed to write foliate js file");
      }

      setAllowedUris(`${pdfFileUri},${foliateFileUri},${pdfWorkerUri}`);

      if (src) {
        const sourceType = getSourceType(src);
        const isExternalSource = isURL(src);
        const isSrcInFs = isFsUri(src);

        if (!sourceType) {
          throw new Error(`Invalid source type: ${src}`);
        }

        if (!isExternalSource) {
          if (isSrcInFs) {
            setAllowedUris(
              `${src},${pdfFileUri},${foliateFileUri},${pdfWorkerUri}`
            );
          }
          if (sourceType === SourceType.BASE64) {
            setTemplate(
              injectWebVieWVariables({
                foliate: foliateFileUri,
                pdf: pdfFileUri,
                book: src,
                location: initialLocation,
              })
            );

            setIsLoading(false);
          } else {
            setTemplate(
              injectWebVieWVariables({
                pdf: pdfFileUri,
                foliate: foliateFileUri,
                book: src,
                location: initialLocation,
              })
            );

            setIsLoading(false);
          }
        }

        if (isExternalSource) {
          const sourceName = getSourceName(src);

          if (!sourceName) {
            throw new Error(`Invalid source name: ${src}`);
          }

          if (
            sourceType === SourceType.OPF ||
            sourceType === SourceType.EPUB ||
            sourceType === SourceType.CBZ ||
            sourceType === SourceType.FB2 ||
            sourceType === SourceType.MOBI ||
            sourceType === SourceType.FBZ ||
            sourceType === SourceType.PDF ||
            sourceType === SourceType.AZW3
          ) {
            setTemplate(
              injectWebVieWVariables({
                pdf: pdfFileUri,
                foliate: foliateFileUri,
                book: src,
                location: initialLocation,
              })
            );

            setIsLoading(false);
          } else {
            const { uri: bookFileUri } = await downloadFile(src, sourceName);

            if (!bookFileUri) throw new Error("Couldn't download book");

            setAllowedUris(`${bookFileUri},${pdfFileUri},${foliateFileUri}`);

            setTemplate(
              injectWebVieWVariables({
                pdf: pdfFileUri,
                foliate: foliateFileUri,
                book: bookFileUri,
                location: initialLocation,
              })
            );

            setIsLoading(false);
          }
        }
      }
    })();
  }, [
    downloadFile,
    initialLocations,
    injectWebVieWVariables,
    setIsLoading,
    src,
  ]);

  useEffect(() => {
    const saveTemplateFileToDoc = async () => {
      try {
        if (template) {
          const content = template;

          const fileUri = `${FileSystem.documentDirectory}index.html`;
          await FileSystem.writeAsStringAsync(fileUri, content);
          setTemplateUrl(fileUri);
        }
      } catch (error) {
        throw new Error("Error saving index.html file:");
      }
    };
    if (template) {
      saveTemplateFileToDoc();
    }
  }, [template]);

  if (isLoading) {
    return renderLoadingFileComponent({
      fileSize,
      downloadProgress,
      downloadSuccess,
      downloadError,
    });
  }

  if (!templateUrl || !allowedUris) {
    return renderLoadingFileComponent({
      fileSize,
      downloadProgress,
      downloadSuccess,
      downloadError,
    });
  }
  return (
    <View
      templateUri={templateUrl}
      allowedUris={allowedUris}
      width={width}
      height={height}
      // defaultTheme={defaultTheme}
      {...rest}
    />
  );
}
