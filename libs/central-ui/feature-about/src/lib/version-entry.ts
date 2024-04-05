import { Version } from './version';

export interface VersionEntry extends Version {
    key: string;
    description: string;
}
