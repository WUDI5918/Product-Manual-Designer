
export enum ComponentType {
  Text = 'Text',
  Image = 'Image',
  Table = 'Table',
  Quote = 'Quote',
  List = 'List',
  AdvancedBlock = 'AdvancedBlock',
  Divider = 'Divider',
  Formula = 'Formula',
  Icon = 'Icon',
}

export interface Component {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  props: any;
  isGenerated?: boolean; // For auto-generated components like page numbers
}

export interface Page {
  id:string;
  name: string;
  header: Component[];
  body: Component[];
  footer: Component[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  tags: string[];
  previewImage?: string;
  page: Omit<Page, 'id' | 'name'>;
}

export interface BrandKit {
  logo: string | null;
  colors: string[];
  fonts: string[];
}

export interface AssetImage {
  id: string;
  src: string;
}

export interface AssetIcon {
  id: string;
  name: string;
  className: string;
}

export interface Assets {
  images: AssetImage[];
  icons: AssetIcon[];
  brandKit: BrandKit;
}

export interface EditorState {
  projectName: string;
  pages: Page[];
  currentPageIndex: number;
  selectedComponentId: string | null;
  gridSize: number;
  isGridVisible: boolean;
  isSnapToGridEnabled: boolean;
  templates: Template[];
  assets: Assets;
  documentSettings: {
    showHeaders: boolean;
    headerHeight: number;
    headerBackgroundImage: string | null;
    headerBackgroundImageAlign: 'left' | 'center' | 'right';
    showFooters: boolean;
    footerHeight: number;
    footerBackgroundImage: string | null;
    footerBackgroundImageAlign: 'left' | 'center' | 'right';
    showPageNumbers: boolean;
    pageNumberFormat: string;
    pageNumberAlign: 'left' | 'center' | 'right';
    pageNumberFontSize: number;
    pageNumberColor: string;
    pageMarginLeft: number;
    pageMarginRight: number;
  };
}

export interface Project {
  id: string;
  name: string;
  lastModified: number;
  state: EditorState;
}


export const SUPPORTED_LANGUAGES = [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'php', 'ruby', 'go',
    'swift', 'kotlin', 'rust', 'html', 'css', 'scss', 'sql', 'bash', 'json', 'yaml'
];

export const COMPONENT_LIBRARY = [
  {
    type: ComponentType.Text,
    icon: 'fas fa-paragraph',
    label: 'Text',
    category: 'element',
    defaultProps: { 
        text: 'Type here...', 
        textType: 'paragraph', 
        fontSize: 16, 
        color: '#334155', 
        fontWeight: 'normal', 
        fontStyle: 'normal', 
        textAlign: 'left', 
        textDecorationLine: 'none',
        lineHeight: 1.5,
        letterSpacing: 0,
        textTransform: 'none',
        backgroundColor: 'transparent',
        padding: 0,
    },
    defaultSize: { width: 200, height: 40 },
  },
  {
    type: ComponentType.Image,
    icon: 'fas fa-image',
    label: 'Image',
    category: 'element',
    defaultProps: { 
        src: 'https://storage.googleapis.com/a1aa/image/aenPS3fkmco8p0BWw22ZceiCZj2vuw887Za1LL7jAat2kirnA.jpg', 
        alt: 'placeholder', 
        objectFit: 'cover',
        opacity: 1,
        borderRadius: 0,
        borderWidth: 0,
        borderColor: '#000000',
        boxShadow: false,
    },
    defaultSize: { width: 240, height: 180 },
  },
  {
    type: ComponentType.Icon,
    icon: 'fas fa-icons',
    label: 'Icon',
    category: 'element',
    defaultProps: {
      className: 'fas fa-star',
      color: '#334155',
    },
    defaultSize: { width: 50, height: 50 },
  },
  {
    type: ComponentType.Divider,
    icon: 'fas fa-minus',
    label: 'Divider',
    category: 'element',
    defaultProps: {
      lineStyle: 'solid', // 'solid', 'dashed', 'dotted'
      weight: 2, // in px
      color: '#cbd5e1', // tailwind gray-300
    },
    defaultSize: { width: 400, height: 20 },
  },
   {
    type: ComponentType.Formula,
    icon: 'fas fa-calculator',
    label: 'Formula',
    category: 'element',
    defaultProps: {
      formula: 'c = \\sqrt{a^2 + b^2}',
      fontSize: 20,
      color: '#334155',
    },
    defaultSize: { width: 200, height: 50 },
  },
  {
    type: ComponentType.Table,
    icon: 'fas fa-table',
    label: 'Table',
    category: 'block',
    defaultProps: {
      headers: [
        { text: 'Parameter', rowspan: 1, colspan: 1 }, 
        { text: 'Value', rowspan: 1, colspan: 1 }
      ],
      rows: [
        [{ text: 'Voltage', rowspan: 1, colspan: 1 }, { text: '220V', rowspan: 1, colspan: 1 }], 
        [{ text: 'Power', rowspan: 1, colspan: 1 }, { text: '1.5kW', rowspan: 1, colspan: 1 }]
      ],
      headerColor: '#3b82f6',
      headerTextColor: '#ffffff',
      headerFontWeight: 'bold',
      alternateRowColor: '#f1f5f9',
      cellPadding: 8,
      borderColor: '#cbd5e1',
      borderWidth: 1,
      cellFontSize: 14,
      cellTextColor: '#334155',
      selectedCell: null,
    },
    defaultSize: { width: 360, height: 120 },
  },
  {
    type: ComponentType.Quote,
    icon: 'fas fa-quote-left',
    label: 'Quote',
    category: 'block',
    defaultProps: {
      quoteType: 'default', // 'default', 'info', 'success', 'warning', 'danger'
      text: 'This is an inspiring quote about the product.',
      author: 'A. Customer',
    },
    defaultSize: { width: 400, height: 100 },
  },
  {
    type: ComponentType.List,
    icon: 'fas fa-list-ul',
    label: 'List',
    category: 'block',
    defaultProps: {
      type: 'unordered',
      items: ['List item 1', 'List item 2', 'List item 3'],
      fontSize: 16,
      lineSpacing: 1.5,
      textColor: '#334155',
    },
    defaultSize: { width: 220, height: 100 },
  },
  {
    type: ComponentType.AdvancedBlock,
    icon: 'fas fa-cogs',
    label: 'Advanced Block',
    category: 'block',
    defaultProps: {
      blockType: 'code', // 'code', 'alert', 'collapsible'
      // Code props
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      // Alert props (now part of Quote component)
      // Collapsible props
      collapsibleTitle: 'Click to Expand',
      collapsibleContent: 'This is the hidden content that will be revealed.',
      isCollapsed: true,
    },
    defaultSize: { width: 500, height: 200 },
  },
];

const INITIAL_TEMPLATES: Template[] = [];

const INITIAL_ICONS: AssetIcon[] = [
    { id: 'icon-info', name: 'Info Circle', className: 'fas fa-info-circle' },
    { id: 'icon-warning', name: 'Warning Sign', className: 'fas fa-exclamation-triangle' },
    { id: 'icon-check', name: 'Check Circle', className: 'fas fa-check-circle' },
    { id: 'icon-tools', name: 'Tools', className: 'fas fa-tools' },
    { id: 'icon-power', name: 'Power Off', className: 'fas fa-power-off' },
    { id: 'icon-cog', name: 'Settings Cog', className: 'fas fa-cog' },
    { id: 'icon-lightbulb', name: 'Lightbulb', className: 'fas fa-lightbulb' },
    { id: 'icon-question', name: 'Question Circle', className: 'fas fa-question-circle' },
    { id: 'icon-plug', name: 'Plug', className: 'fas fa-plug' },
];


export const INITIAL_STATE: EditorState = {
  projectName: '',
  pages: [],
  currentPageIndex: 0,
  selectedComponentId: null,
  gridSize: 20,
  isGridVisible: true,
  isSnapToGridEnabled: true,
  templates: INITIAL_TEMPLATES,
  assets: {
      images: [],
      icons: INITIAL_ICONS,
      brandKit: {
          logo: null,
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'],
          fonts: ['Inter', 'Roboto', 'Lato', 'Montserrat']
      }
  },
  documentSettings: {
    showHeaders: true,
    headerHeight: 100,
    headerBackgroundImage: null,
    headerBackgroundImageAlign: 'center',
    showFooters: true,
    footerHeight: 80,
    footerBackgroundImage: null,
    footerBackgroundImageAlign: 'center',
    showPageNumbers: false,
    pageNumberFormat: 'Page {currentPage} of {totalPages}',
    pageNumberAlign: 'right',
    pageNumberFontSize: 10,
    pageNumberColor: '#4a5568',
    pageMarginLeft: 40,
    pageMarginRight: 40,
  },
};

// FIX: Added missing type definitions for sections.
export interface TableData {
  headers: string[];
  rows: string[][];
  headerColor?: string;
}

export interface GallerySectionData {
  title: string;
  items: {
    id: string;
    image: string;
    title: string;
    description: string;
  }[];
}

export interface ProductDetailSectionData {
  title:string;
  image: string;
  productName: string;
  productDescription: string;
  applicationDomain: string;
  productAdvantages: string;
  parametersTitle: string;
  parametersTable: TableData;
}

export interface InterfaceSpecSectionData {
  title: string;
  image: string;
  table: TableData;
}

export interface IndicatorStatusSectionData {
  title: string;
  image: string;
  table: {
    headers: string[];
    rows: string[][];
    colors: string[];
  };
}

export interface CaseStudySectionData {
  title: string;
  cases: {
    id: string;
    image: string;
    title: string;
    description: string;
  }[];
}

export interface ConnectorSectionData {
  title: string;
  description: string;
  image: string;
  notice: string;
  listItems: string[];
  pinoutTitle: string;
  pinoutTable: TableData;
}

export interface MarkdownSectionData {
  title: string;
  markdown: string;
}

export type BuilderComponentType = 'card' | 'quote' | 'text';

export interface BuilderComponent {
    id: string;
    type: BuilderComponentType;
    data: any;
    position: { x: number, y: number };
}

export interface ComponentBuilderSectionData {
    title: string;
    components: BuilderComponent[];
}
