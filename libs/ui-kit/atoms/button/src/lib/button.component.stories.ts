import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ButtonConstants } from './button.constants';

const meta: Meta<ButtonComponent> = {
    component: ButtonComponent,
    title: 'ButtonComponent',
    tags: ['autodocs'],
    argTypes: {
        type: {
            options: Object.values(ButtonConstants.Type),
            control: { type: 'select' },
            defaultValue: ['primary'],
            description: 'Common button component to be used accross all the apps',
        },
    },
};
export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
    args: {
        type: ButtonConstants.Type.Primary,
        label: 'Button',
    },
};

export const Secondary: Story = {
    args: {
        type: ButtonConstants.Type.Secondary,
        label: 'Secondary',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        expect(canvas.getByRole('button')).toHaveTextContent('Secondary');
    },
};

export const Tertiary: Story = {
    args: {
        type: ButtonConstants.Type.Tertiary,
        label: 'Tertiary',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        expect(canvas.getByRole('button')).toHaveTextContent('Tertiary');
    },
};

export const LinkButton: Story = {
    args: {
        type: ButtonConstants.Type.Link,
        label: 'Link',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        expect(canvas.getByRole('button')).toHaveTextContent('Link');
    },
};
