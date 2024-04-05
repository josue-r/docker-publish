import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';
import { CardTitleComponent, CardTitleConstants } from '@vioc-angular/ui-kit/atoms/card-title';
import { CardContentComponent } from '@vioc-angular/ui-kit/atoms/card-content';

const meta: Meta<CardComponent> = {
    component: CardComponent,
    title: 'CardComponent',
    tags: ['autodocs'],
    argTypes: {
        titleSize: {
            options: Object.values(CardTitleConstants.Size),
            control: { type: 'radio' },
            defaultValue: [CardTitleConstants.Size.Medium],
            description: 'Size of the title',
        },
        titleColor: {
            options: Object.values(CardTitleConstants.Color),
            control: { type: 'select' },
            defaultValue: [CardTitleConstants.Color.Primary],
            description: 'Defines the background color of the title',
        },
        titleAlign: {
            options: Object.values(CardTitleConstants.Align),
            control: { type: 'select' },
            defaultValue: [CardTitleConstants.Align.Center],
            description: 'Defines the align of the title',
        },
    },
    decorators: [
        moduleMetadata({
            imports: [CardTitleComponent, CardContentComponent],
        }),
    ],
};
export default meta;
type Story = StoryObj<CardComponent>;

export const Primary: Story = {
    args: {
        titleSize: CardTitleConstants.Size.Medium,
        titleColor: CardTitleConstants.Color.Primary,
        title: 'Title',
        titleAlign: CardTitleConstants.Align.Center,
    },
    render: (argsToTemplate: CardComponent) => ({
        props: argsToTemplate,
        template: `
        <vioc-card [title]="title" [titleColor]="titleColor" [titleSize]="titleSize" [titleAlign]="titleAlign">
            <vioc-card-title
                [label]="title"
                [size]="'medium'"
                [color]="'secondary'"
                [align]="'left'"
            ></vioc-card-title>
            <vioc-card-content
                [size]="'medium'"
                [titleColor]="'primary'"
                [title]="'Title'"
                [description]="'Testing description'"
            ></vioc-card-content>
            <vioc-card-content
                [size]="'medium'"
                [titleColor]="'secondary'"
                [title]="'Title222'"
                [description]="'Testing description222'"
            ></vioc-card-content>
        </vioc-card>
        `,
    }),
};
