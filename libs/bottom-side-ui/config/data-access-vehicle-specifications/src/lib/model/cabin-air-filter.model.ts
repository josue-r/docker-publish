export class CabinAirFilter {
    id: string = null;
    type?: string = '';
    qualifier?: string = '';
    part: string = '';
    notes?: Note[] = [];
}

export class Note {
    id: string = null;
    value: string = null;
}
