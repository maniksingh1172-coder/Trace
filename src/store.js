import { create } from 'zustand';

const createEmptyPage = (id) => ({
  id,
  elements: [],
  history: [[]],
  historyStep: 0,
});

export const useStore = create((set, get) => ({
  pages: [createEmptyPage('Page 1')],
  currentPageIndex: 0,
  isPdfMode: false,
  isDarkMode: false,
  setIsPdfMode: (mode) => set({ isPdfMode: mode }),
  toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),

  
  tool: null,
  color: '#6366f1',
  strokeWidth: 4,
  fontFamily: 'Arial',
  fontSize: 24,
  isBold: false,
  isItalic: false,
  dash: [],
  penType: 'pen', // 'pen', 'highlighter', 'brush', 'fill', etc.

  setTool: (tool) => set({ tool }),
  setDash: (dash) => set({ dash }),
  setPenType: (penType) => set({ penType }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  toggleBold: () => set(state => ({ isBold: !state.isBold })),
  toggleItalic: () => set(state => ({ isItalic: !state.isItalic })),
  toggleUnderline: () => set(state => ({ isUnderline: !state.isUnderline })),

  getCurrentPage: () => {
    const state = get();
    return state.pages[state.currentPageIndex];
  },

  setElements: (elements, overwrite = false) => {
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const page = state.pages[pageIndex];
      
      let newHistory = page.history;
      let newStep = page.historyStep;

      // Only save to history if we explicitly say it's not an overwrite
      if (!overwrite) {
        newHistory = page.history.slice(0, page.historyStep + 1);
        newHistory.push(elements);
        newStep = newHistory.length - 1;
      }

      const newPages = [...state.pages];
      newPages[pageIndex] = {
        ...page,
        elements,
        history: newHistory,
        historyStep: newStep
      };

      return { pages: newPages };
    });
  },

  updateElement: (id, newProps) => {
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const page = state.pages[pageIndex];
      
      const elements = page.elements.map(el => el.id === id ? { ...el, ...newProps } : el);
      
      const newHistory = page.history.slice(0, page.historyStep + 1);
      newHistory.push(elements);
      
      const newPages = [...state.pages];
      newPages[pageIndex] = {
        ...page,
        elements,
        history: newHistory,
        historyStep: newHistory.length - 1
      };
      return { pages: newPages };
    });
  },

  // Bulk update multiple elements at once (saves 1 history step)
  updateElements: (updatesArray) => {
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const page = state.pages[pageIndex];
      
      let elements = [...page.elements];
      updatesArray.forEach(update => {
        elements = elements.map(el => el.id === update.id ? { ...el, ...update.newProps } : el);
      });
      
      const newHistory = page.history.slice(0, page.historyStep + 1);
      newHistory.push(elements);
      
      const newPages = [...state.pages];
      newPages[pageIndex] = {
        ...page,
        elements,
        history: newHistory,
        historyStep: newHistory.length - 1
      };
      return { pages: newPages };
    });
  },

  deleteElement: (id) => {
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const page = state.pages[pageIndex];
      
      const elements = page.elements.filter(el => el.id !== id);
      
      const newHistory = page.history.slice(0, page.historyStep + 1);
      newHistory.push(elements);
      
      const newPages = [...state.pages];
      newPages[pageIndex] = {
        ...page,
        elements,
        history: newHistory,
        historyStep: newHistory.length - 1
      };
      return { pages: newPages };
    });
  },

  deleteElements: (ids) => {
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const page = state.pages[pageIndex];
      
      const elements = page.elements.filter(el => !ids.includes(el.id));
      
      const newHistory = page.history.slice(0, page.historyStep + 1);
      newHistory.push(elements);
      
      const newPages = [...state.pages];
      newPages[pageIndex] = {
        ...page,
        elements,
        history: newHistory,
        historyStep: newHistory.length - 1
      };
      return { pages: newPages };
    });
  },

  undo: () => {
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const page = state.pages[pageIndex];
      
      if (page.historyStep === 0) return state;
      const newStep = page.historyStep - 1;
      
      const newPages = [...state.pages];
      newPages[pageIndex] = {
        ...page,
        historyStep: newStep,
        elements: page.history[newStep]
      };
      return { pages: newPages };
    });
  },

  redo: () => {
    set((state) => {
      const pageIndex = state.currentPageIndex;
      const page = state.pages[pageIndex];
      
      if (page.historyStep === page.history.length - 1) return state;
      const newStep = page.historyStep + 1;
      
      const newPages = [...state.pages];
      newPages[pageIndex] = {
        ...page,
        historyStep: newStep,
        elements: page.history[newStep]
      };
      return { pages: newPages };
    });
  },

  clear: () => {
    const state = get();
    const pageIndex = state.currentPageIndex;
    const page = state.pages[pageIndex];
    if (page.elements.length === 0) return;
    
    const docs = page.elements.filter(el => el.isDocument);
    const newHistory = page.history.slice(0, page.historyStep + 1);
    newHistory.push(docs);
    
    const newPages = [...state.pages];
    newPages[pageIndex] = {
      ...page,
      elements: docs,
      history: newHistory,
      historyStep: newHistory.length - 1
    };
    
    set({ pages: newPages });
  },

  addPage: (index) => {
    set((state) => {
      const newPage = { id: `Page ${state.pages.length + 1}`, elements: [], history: [[]], historyStep: 0 };
      const newPages = [...state.pages];
      if (typeof index === 'number') {
        newPages.splice(index, 0, newPage);
      } else {
        newPages.push(newPage);
      }
      
      // Re-index all pages
      newPages.forEach((p, i) => { p.id = `Page ${i + 1}`; });
      
      return {
        pages: newPages,
        currentPageIndex: typeof index === 'number' ? index : state.pages.length
      };
    });
  },

  setPageIndex: (index) => set({ currentPageIndex: index }),

  deletePage: (index) => {
    set((state) => {
      if (state.pages.length <= 1) return state;
      const targetIndex = typeof index === 'number' ? index : state.currentPageIndex;
      const newPages = state.pages.filter((_, i) => i !== targetIndex);
      
      // Re-index all pages
      newPages.forEach((p, i) => { p.id = `Page ${i + 1}`; });
      
      let newIndex = state.currentPageIndex;
      if (newIndex >= newPages.length) newIndex = newPages.length - 1;
      // If we deleted a page BEFORE the current one, shift current index back
      if (typeof index === 'number' && index < state.currentPageIndex) {
        newIndex = state.currentPageIndex - 1;
      }
      
      return { pages: newPages, currentPageIndex: newIndex };
    });
  },

  duplicatePage: (index) => {
    set((state) => {
      const targetIndex = typeof index === 'number' ? index : state.currentPageIndex;
      const pageToCopy = state.pages[targetIndex];
      const copiedElements = pageToCopy.elements.map(el => ({
          ...el,
          id: el.id + "_copy_" + Math.random().toString().slice(2, 6)
      }));
      const newPage = { 
        id: `Temp`, 
        elements: copiedElements, 
        history: [[...copiedElements]], 
        historyStep: 0 
      };
      
      const newPages = [...state.pages];
      newPages.splice(targetIndex + 1, 0, newPage);
      
      // Re-index all
      newPages.forEach((p, i) => { p.id = `Page ${i + 1}`; });
      
      return { 
        pages: newPages, 
        currentPageIndex: targetIndex + 1 
      };
    });
  },

  setPages: (pages) => set({ pages }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index })
}));
