import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppFooter from "./AppFooter.vue";

describe("AppFooter", () => {
	describe("Rendering", () => {
		it("should render footer element", () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.find("footer").exists()).toBe(true);
		});

		it("should have app-footer class", () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.find(".app-footer").exists()).toBe(true);
		});
	});

	describe("Copyright", () => {
		it("should display copyright text", () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.text()).toContain("©");
		});

		it("should display current year", () => {
			const wrapper = mount(AppFooter);
			const currentYear = new Date().getFullYear();
			expect(wrapper.text()).toContain(currentYear.toString());
		});

		it("should display company name", () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.text()).toContain("POS NFC-e");
		});

		it("should display custom company name", () => {
			const wrapper = mount(AppFooter, {
				props: {
					companyName: "Custom Company",
				},
			});
			expect(wrapper.text()).toContain("Custom Company");
		});
	});

	describe("Version", () => {
		it("should not show version by default", () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.find(".app-footer__version").exists()).toBe(false);
		});

		it("should show version when provided", () => {
			const wrapper = mount(AppFooter, {
				props: {
					version: "1.0.0",
				},
			});
			expect(wrapper.find(".app-footer__version").exists()).toBe(true);
			expect(wrapper.find(".app-footer__version").text()).toContain("1.0.0");
		});
	});

	describe("Links Slot", () => {
		it("should render links slot", () => {
			const wrapper = mount(AppFooter, {
				slots: {
					links: '<a href="/privacy">Privacy</a><a href="/terms">Terms</a>',
				},
			});
			expect(wrapper.html()).toContain("Privacy");
			expect(wrapper.html()).toContain("Terms");
		});

		it("should not show links section if slot is empty", () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.find(".app-footer__links").exists()).toBe(false);
		});
	});

	describe("Accessibility", () => {
		it('should have role="contentinfo"', () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.find("footer").attributes("role")).toBe("contentinfo");
		});
	});

	describe("Responsive", () => {
		it("should have responsive class", () => {
			const wrapper = mount(AppFooter);
			expect(wrapper.classes()).toContain("app-footer");
		});
	});
});
