import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Test helper: components using react-dnd need a provider around them.
export const withDnd = (ui: JSX.Element): JSX.Element => <DndProvider backend={HTML5Backend}>{ui}</DndProvider>
