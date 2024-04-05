import type { Meta, StoryObj } from '@storybook/angular';
import { CardTitleComponent } from './card-title.component';
import { CardTitleConstants } from './card-title.constants';

const meta: Meta<CardTitleComponent> = {
    component: CardTitleComponent,
    title: 'CardTitleComponent',
    tags: ['autodocs'],
    argTypes: {
        size: {
            options: Object.values(CardTitleConstants.Size),
            control: { type: 'radio' },
            defaultValue: [CardTitleConstants.Size.Medium],
            description: 'Size of the title',
        },
        color: {
            options: Object.values(CardTitleConstants.Color),
            control: { type: 'select' },
            defaultValue: [CardTitleConstants.Color.Primary],
            description: 'Defines the background color of the title',
        },
        align: {
            options: Object.values(CardTitleConstants.Align),
            control: { type: 'select' },
            defaultValue: [CardTitleConstants.Align.Center],
            description: 'Defines the alignment of the title',
        },
    },
};
export default meta;
type Story = StoryObj<CardTitleComponent>;

export const Primary: Story = {
    args: {
        size: CardTitleConstants.Size.Medium,
        color: CardTitleConstants.Color.Primary,
        align: CardTitleConstants.Align.Left,
        label: 'Title',
    },
};
