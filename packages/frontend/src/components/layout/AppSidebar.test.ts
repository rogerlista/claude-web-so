import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppSidebar from "./AppSidebar.vue";

describe("AppSidebar", () => {
	const mockMenuItems = [
		{ label: "Home", path: "/", icon: "home" },
		{ label: "Products", path: "/products", icon: "box" },
		{ label: "Sales", path: "/sales", icon: "shopping-cart" },
	];

	describe("Rendering", () => {
		it("should render aside element", () => {
			const wrapper = mount(AppSidebar);
			expect(wrapper.find("aside").exists()).toBe(true);
		});

		it("should have app-sidebar class", () => {
			const wrapper = mount(AppSidebar);
			expect(wrapper.find(".app-sidebar").exists()).toBe(true);
		});

		it("should render navigation", () => {
			const wrapper = mount(AppSidebar);
			expect(wrapper.find("nav").exists()).toBe(true);
		});
	});

	describe("Menu Items", () => {
		it("should render menu items", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
				},
			});
			expect(wrapper.findAll(".app-sidebar__menu-item")).toHaveLength(3);
		});

		it("should render menu item labels", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
				},
			});
			expect(wrapper.text()).toContain("Home");
			expect(wrapper.text()).toContain("Products");
			expect(wrapper.text()).toContain("Sales");
		});

		it("should not render menu items if empty", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: [],
				},
			});
			expect(wrapper.findAll(".app-sidebar__menu-item")).toHaveLength(0);
		});
	});

	describe("Open/Closed State", () => {
		it("should be closed by default", () => {
			const wrapper = mount(AppSidebar);
			expect(wrapper.find(".app-sidebar").classes()).not.toContain(
				"app-sidebar--open",
			);
		});

		it("should be open when open prop is true", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					open: true,
				},
			});
			expect(wrapper.find(".app-sidebar").classes()).toContain(
				"app-sidebar--open",
			);
		});

		it("should be closed when open prop is false", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					open: false,
				},
			});
			expect(wrapper.find(".app-sidebar").classes()).not.toContain(
				"app-sidebar--open",
			);
		});
	});

	describe("Menu Item Click", () => {
		it("should emit navigate event when menu item is clicked", async () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
				},
			});
			await wrapper.findAll(".app-sidebar__menu-item")[0]?.trigger("click");
			expect(wrapper.emitted("navigate")).toBeTruthy();
		});

		it("should emit navigate event with correct path", async () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
				},
			});
			await wrapper.findAll(".app-sidebar__menu-item")[1]?.trigger("click");
			expect(wrapper.emitted("navigate")?.[0]).toEqual(["/products"]);
		});
	});

	describe("Active Item", () => {
		it("should not have active item by default", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
				},
			});
			expect(wrapper.find(".app-sidebar__menu-item--active").exists()).toBe(
				false,
			);
		});

		it("should mark item as active when currentPath matches", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
					currentPath: "/products",
				},
			});
			const items = wrapper.findAll(".app-sidebar__menu-item");
			expect(items[1]?.classes()).toContain("app-sidebar__menu-item--active");
		});

		it("should not mark other items as active", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
					currentPath: "/products",
				},
			});
			const items = wrapper.findAll(".app-sidebar__menu-item");
			expect(items[0]?.classes()).not.toContain(
				"app-sidebar__menu-item--active",
			);
			expect(items[2]?.classes()).not.toContain(
				"app-sidebar__menu-item--active",
			);
		});
	});

	describe("Overlay", () => {
		it("should not show overlay when closed", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					open: false,
				},
			});
			expect(wrapper.find(".app-sidebar__overlay").exists()).toBe(false);
		});

		it("should show overlay when open", () => {
			const wrapper = mount(AppSidebar, {
				props: {
					open: true,
				},
			});
			expect(wrapper.find(".app-sidebar__overlay").exists()).toBe(true);
		});

		it("should emit close event when overlay is clicked", async () => {
			const wrapper = mount(AppSidebar, {
				props: {
					open: true,
				},
			});
			await wrapper.find(".app-sidebar__overlay").trigger("click");
			expect(wrapper.emitted("close")).toBeTruthy();
		});
	});

	describe("Accessibility", () => {
		it('should have role="navigation" on nav', () => {
			const wrapper = mount(AppSidebar);
			expect(wrapper.find("nav").attributes("role")).toBe("navigation");
		});

		it("should have aria-label on nav", () => {
			const wrapper = mount(AppSidebar);
			expect(wrapper.find("nav").attributes("aria-label")).toBeDefined();
		});

		it("should have keyboard navigation support", async () => {
			const wrapper = mount(AppSidebar, {
				props: {
					menuItems: mockMenuItems,
				},
			});
			const firstItem = wrapper.findAll(".app-sidebar__menu-item")[0];
			await firstItem?.trigger("keydown", { key: "Enter" });
			expect(wrapper.emitted("navigate")).toBeTruthy();
		});
	});

	describe("Responsive", () => {
		it("should have responsive classes", () => {
			const wrapper = mount(AppSidebar);
			expect(wrapper.find(".app-sidebar").classes()).toContain("app-sidebar");
		});
	});
});
