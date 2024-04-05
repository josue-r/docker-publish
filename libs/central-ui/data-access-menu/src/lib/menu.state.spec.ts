import { fakeAsync, flush } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { MenuState } from './menu.state';
import { MenuItem } from './models/menu-item';
import { mockMenus, rootMenuItem1 } from './models/menu-item.mock';

describe('MenuState', () => {
    let state: MenuState;

    beforeEach(() => (state = new MenuState()));

    it('should update', fakeAsync(() => {
        state.updateMenu(mockMenus);
        state.menus.pipe(take(1)).subscribe((menus: MenuItem[]) => expect(menus).toEqual(mockMenus));
        flush();
    }));

    describe('allMenuItems', () => {
        const verifyUnmodifiable = (itemSupplier: () => MenuItem) => {
            const originalName = itemSupplier().name;
            const testName = 'new test name';
            itemSupplier().name = testName;
            expect(itemSupplier().name).toEqual(originalName);
            expect(itemSupplier().name).not.toEqual(testName);
        };
        const verifyItemsNotRemovable = (itemListSuppler: () => MenuItem[]) => {
            const originalLength = itemListSuppler().length;
            itemListSuppler().pop();
            expect(itemListSuppler().length).toEqual(originalLength);
        };
        const verifyItemsNotAddable = (itemListSuppler: () => MenuItem[]) => {
            const originalLength = itemListSuppler().length;
            itemListSuppler().push(rootMenuItem1);
            expect(itemListSuppler().length).toEqual(originalLength);
        };

        it('should contain items that are not modifiable', () => {
            verifyUnmodifiable(() => state.allMenuItems[0]);
        });
        it('should not have items removed', () => {
            verifyItemsNotRemovable(() => state.allMenuItems);
        });
        it('should not have items added', () => {
            verifyItemsNotAddable(() => state.allMenuItems);
        });
        it('should have children items that are not modifiable', () => {
            verifyUnmodifiable(() => state.allMenuItems[0].subMenus[0]);
        });
        it('should not have items removed from child menuItem arrays', () => {
            verifyItemsNotRemovable(() => state.allMenuItems[0].subMenus);
        });
        it('should not have items added to child menuItem arrays', () => {
            verifyItemsNotAddable(() => state.allMenuItems[0].subMenus);
        });
    });
});
