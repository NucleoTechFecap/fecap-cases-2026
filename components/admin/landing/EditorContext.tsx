"use client";

import { createContext, useContext } from "react";

type EditorContextValue = { canEdit: boolean; canPublish: boolean };

const Context = createContext<EditorContextValue>({ canEdit: false, canPublish: false });

export const EditorContextProvider = Context.Provider;

export function useEditorContext(): EditorContextValue {
  return useContext(Context);
}
