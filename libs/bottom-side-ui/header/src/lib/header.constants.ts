import { BadgeConstants } from '@vioc-angular/ui-kit/atoms/badge';
import { StatusConstants } from '@vioc-angular/ui-kit/atoms/status';

export enum HEADER_STATUS {
    NO_VEHICLE_ASSIGNED = 'NO VEHICLE ASSIGNED',
    GREETED = 'GREETED',
    VERIFY_SHOWTIME = 'VERIFY SHOWTIME',
    SERVICE_REVIEW = 'SERVICE REVIEW',
}

export const STATUS_CONFIGURATIONS = {
    [HEADER_STATUS.NO_VEHICLE_ASSIGNED]: {
        label: HEADER_STATUS.NO_VEHICLE_ASSIGNED,
        color: StatusConstants.Color.Gray,
    },
    [HEADER_STATUS.GREETED]: {
        label: HEADER_STATUS.GREETED,
        color: StatusConstants.Color.Green,
    },
    [HEADER_STATUS.VERIFY_SHOWTIME]: {
        label: HEADER_STATUS.VERIFY_SHOWTIME,
        color: StatusConstants.Color.Yellow,
    },
    [HEADER_STATUS.SERVICE_REVIEW]: {
        label: HEADER_STATUS.SERVICE_REVIEW,
        color: StatusConstants.Color.DarkBlue,
    },
};

export enum FLAGS {
    EVAC = 'EVAC',
    FLEET = 'FLEET',
}

export const FLAG_CONFIGURATIONS = {
    [FLAGS.EVAC]: {
        style: BadgeConstants.Style.Square,
        color: BadgeConstants.Color.Error,
        label: FLAGS.EVAC,
    },
    [FLAGS.FLEET]: {
        style: BadgeConstants.Style.Square,
        color: BadgeConstants.Color.Black,
        label: FLAGS.FLEET,
    },
};
