export type ArrowKeyDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export interface ArrowKeyEvent {
    columnIndex: number;
    rowIndex: number;
    direction: ArrowKeyDirection;
}
