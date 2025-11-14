import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppHeader from "./AppHeader.vue";

describe("AppHeader", () => {
	describe("Rendering", () => {
		it("should render header element", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find("header").exists()).toBe(true);
		});

		it("should have app-header class", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find(".app-header").exists()).toBe(true);
		});

		it("should render logo", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find(".app-header__logo").exists()).toBe(true);
		});

		it("should display application name", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.text()).toContain("POS NFC-e");
		});
	});

	describe("Title Prop", () => {
		it("should render default title", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find(".app-header__title").text()).toBe("POS NFC-e");
		});

		it("should render custom title", () => {
			const wrapper = mount(AppHeader, {
				props: {
					title: "Custom Title",
				},
			});
			expect(wrapper.find(".app-header__title").text()).toBe("Custom Title");
		});
	});

	describe("Menu Toggle", () => {
		it("should not show menu toggle by default", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find(".app-header__menu-toggle").exists()).toBe(false);
		});

		it("should show menu toggle when showMenuToggle is true", () => {
			const wrapper = mount(AppHeader, {
				props: {
					showMenuToggle: true,
				},
			});
			expect(wrapper.find(".app-header__menu-toggle").exists()).toBe(true);
		});

		it("should emit toggle-menu event when menu toggle is clicked", async () => {
			const wrapper = mount(AppHeader, {
				props: {
					showMenuToggle: true,
				},
			});
			await wrapper.find(".app-header__menu-toggle").trigger("click");
			expect(wrapper.emitted("toggle-menu")).toBeTruthy();
		});
	});

	describe("User Section", () => {
		it("should not show user section by default", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find(".app-header__user").exists()).toBe(false);
		});

		it("should show user section when user prop is provided", () => {
			const wrapper = mount(AppHeader, {
				props: {
					user: {
						name: "John Doe",
						email: "john@example.com",
					},
				},
			});
			expect(wrapper.find(".app-header__user").exists()).toBe(true);
		});

		it("should display user name", () => {
			const wrapper = mount(AppHeader, {
				props: {
					user: {
						name: "John Doe",
						email: "john@example.com",
					},
				},
			});
			expect(wrapper.find(".app-header__user-name").text()).toBe("John Doe");
		});

		it("should emit logout event when logout button is clicked", async () => {
			const wrapper = mount(AppHeader, {
				props: {
					user: {
						name: "John Doe",
						email: "john@example.com",
					},
				},
			});
			await wrapper.find(".app-header__logout").trigger("click");
			expect(wrapper.emitted("logout")).toBeTruthy();
		});
	});

	describe("Actions Slot", () => {
		it("should render actions slot", () => {
			const wrapper = mount(AppHeader, {
				slots: {
					actions: '<button class="custom-action">Custom Action</button>',
				},
			});
			expect(wrapper.find(".custom-action").exists()).toBe(true);
		});

		it("should not show actions section if slot is empty", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find(".app-header__actions").exists()).toBe(false);
		});
	});

	describe("Accessibility", () => {
		it('should have role="banner"', () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.find("header").attributes("role")).toBe("banner");
		});

		it("should have aria-label on menu toggle", () => {
			const wrapper = mount(AppHeader, {
				props: {
					showMenuToggle: true,
				},
			});
			expect(
				wrapper.find(".app-header__menu-toggle").attributes("aria-label"),
			).toBeDefined();
		});

		it("should have aria-label on logout button", () => {
			const wrapper = mount(AppHeader, {
				props: {
					user: {
						name: "John Doe",
						email: "john@example.com",
					},
				},
			});
			expect(
				wrapper.find(".app-header__logout").attributes("aria-label"),
			).toBeDefined();
		});
	});

	describe("Responsive", () => {
		it("should have responsive class", () => {
			const wrapper = mount(AppHeader);
			expect(wrapper.classes()).toContain("app-header");
		});
	});
});
