import type { Meta, StoryObj } from '@storybook/angular';
import { StatusComponent } from './status.component';

import { StatusConstants } from './status.constants';

const meta: Meta<StatusComponent> = {
    component: StatusComponent,
    title: 'StatusComponent',
    tags: ['autodocs'],
    argTypes: {
        color: {
            options: Object.values(StatusConstants.Color),
            control: { type: 'select' },
            defaultValue: StatusConstants.Color.Green,
            description: 'Common Status component to be used across all the apps',
        },
    },
};

export default meta;
type Story = StoryObj<StatusComponent>;

export const Greeted: Story = {
    args: {
        color: StatusConstants.Color.Green,
        label: 'greeted',
    },
};

export const VerifyShowtime: Story = {
    args: {
        color: StatusConstants.Color.Yellow,
        label: 'verify showtime',
    },
};

export const ServiceReview: Story = {
    args: {
        color: StatusConstants.Color.LightBlue,
        label: 'service review',
    },
};

export const TodayService: Story = {
    args: {
        color: StatusConstants.Color.DarkBlue,
        label: "today's service",
    },
};

export const PaymentComplete: Story = {
    args: {
        color: StatusConstants.Color.Red,
        label: 'payment complete',
    },
};

export const NoVehicleAssigned: Story = {
    args: {
        color: StatusConstants.Color.Gray,
        label: 'no vehicle assigned',
    },
};
