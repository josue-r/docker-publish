import type { Meta, StoryObj } from '@storybook/angular';
import { CardContentComponent } from './card-content.component';
import { CardContentConstants } from './card-content.constants';

const meta: Meta<CardContentComponent> = {
    component: CardContentComponent,
    title: 'CardContentComponent',
    tags: ['autodocs'],
    argTypes: {
        size: {
            options: Object.values(CardContentConstants.Size),
            control: { type: 'radio' },
            defaultValue: [CardContentConstants.Size.Medium],
            description: 'Size of the title',
        },
        titleColor: {
            options: Object.values(CardContentConstants.Color),
            control: { type: 'select' },
            defaultValue: [CardContentConstants.Color.Primary],
            description: 'Defines the background color of the title',
        },
    },
};
export default meta;
type Story = StoryObj<CardContentComponent>;

export const Primary: Story = {
    args: {
        size: CardContentConstants.Size.Medium,
        titleColor: CardContentConstants.Color.Primary,
        title: 'Title',
        description: 'Testing description',
    },
};
