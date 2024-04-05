import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';
import { BadgeConstants } from './badge.constants';

const meta: Meta<BadgeComponent> = {
    component: BadgeComponent,
    title: 'BadgeComponent',
    tags: ['autodocs'],
    argTypes: {
        style: {
            options: Object.values(BadgeConstants.Style),
            control: { type: 'radio' },
            defaultValue: [BadgeConstants.Style.Round],
            description: 'Shape of the badge',
        },
        color: {
            options: Object.values(BadgeConstants.Color),
            control: { type: 'select' },
            defaultValue: [BadgeConstants.Color.Primary],
            description: 'Defines the color of the badge',
        },
    },
};
export default meta;
type Story = StoryObj<BadgeComponent>;

export const Primary: Story = {
    args: {
        style: BadgeConstants.Style.Round,
        color: BadgeConstants.Color.Primary,
        label: 'Badge',
    },
};
