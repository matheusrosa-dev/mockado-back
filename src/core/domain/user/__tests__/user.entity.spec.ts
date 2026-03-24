/** biome-ignore-all lint/suspicious/noExplicitAny: <It has to allow any in tests> */
import { Uuid } from "../../shared/value-objects/uuid.vo";
import { User, UserFactory } from "../user.entity";

describe("User Entity - Unit Tests", () => {
  describe("constructor", () => {
    it("should instance an user", () => {
      const userProps = {
        userId: new Uuid(),
        googleId: "google-id",
        email: "email@example.com",
        name: "John Doe",
        isActive: false,
        createdAt: new Date(),
      };

      const user = new User(userProps);

      expect(user.toJSON()).toEqual({
        userId: userProps.userId.toString(),
        googleId: userProps.googleId,
        email: userProps.email,
        name: userProps.name,
        isActive: userProps.isActive,
        createdAt: userProps.createdAt,
      });
    });
  });

  describe("entityId", () => {
    it("should return the entityId", () => {
      const id = new Uuid();
      const user = UserFactory.fake().oneUser().withUserId(id).build();

      expect(user.entityId.equals(id)).toBe(true);
    });
  });

  describe("changeName()", () => {
    it("should change the name and validate", () => {
      const user = UserFactory.fake().oneUser().build();
      const spyValidate = jest.spyOn(user, "validate");

      user.changeName("New Name");

      expect(spyValidate).toHaveBeenCalled();
      expect(user.name).toBe("New Name");
    });

    it("should add error to notification when name is empty", () => {
      const user = UserFactory.fake().oneUser().build();

      user.changeName("");

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.get("name")).toContain(
        "name should not be empty",
      );
    });
  });

  describe("changeEmail()", () => {
    it("should change the email and validate", () => {
      const user = UserFactory.fake().oneUser().build();
      const spyValidate = jest.spyOn(user, "validate");

      user.changeEmail("newemail@example.com");

      expect(spyValidate).toHaveBeenCalled();
      expect(user.email).toBe("newemail@example.com");
    });

    it("should add error to notification when email is invalid", () => {
      const user = UserFactory.fake().oneUser().build();

      user.changeEmail("invalid-email");

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.get("email")).toContain(
        "email must be an email",
      );
    });

    it("should add error to notification when email is empty", () => {
      const user = UserFactory.fake().oneUser().build();

      user.changeEmail("");

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.get("email")).toContain(
        "email should not be empty",
      );
    });
  });

  describe("activate()", () => {
    it("should set isActive to true and validate", () => {
      const user = UserFactory.fake().oneUser().withIsActive(false).build();
      const spyValidate = jest.spyOn(user, "validate");

      user.activate();

      expect(spyValidate).toHaveBeenCalled();
      expect(user.isActive).toBe(true);
    });
  });

  describe("deactivate()", () => {
    it("should set isActive to false and validate", () => {
      const user = UserFactory.fake().oneUser().withIsActive(true).build();
      const spyValidate = jest.spyOn(user, "validate");

      user.deactivate();

      expect(spyValidate).toHaveBeenCalled();
      expect(user.isActive).toBe(false);
    });
  });

  describe("toJSON()", () => {
    it("should return a plain object with all fields", () => {
      const user = UserFactory.fake().oneUser().build();

      expect(user.toJSON()).toEqual({
        userId: user.userId.toString(),
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    });
  });

  describe("validate()", () => {
    it("should call validate on create with factory", () => {
      const spyValidate = jest.spyOn(User.prototype, "validate");

      UserFactory.fake().oneUser().build();

      expect(spyValidate).toHaveBeenCalled();
    });

    it("should have no errors for valid props", () => {
      const user = UserFactory.fake().oneUser().build();

      expect(user.notification.hasErrors()).toBe(false);
    });

    it("should add error when googleId is empty", () => {
      const user = UserFactory.fake().oneUser().withGoogleId("").build();

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.size).toBe(1);
      expect(user.notification.errors.get("googleId")).toContain(
        "googleId should not be empty",
      );

      const user2 = UserFactory.fake()
        .oneUser()
        .withGoogleId(null as any)
        .build();

      expect(user2.notification.hasErrors()).toBe(true);
      expect(user2.notification.errors.size).toBe(1);
      expect(user2.notification.errors.get("googleId")).toContain(
        "googleId should not be empty",
      );
    });

    it("should add error when googleId isn't only digits", () => {
      const user = UserFactory.fake()
        .oneUser()
        .withGoogleId("a".repeat(21))
        .build();

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.size).toBe(1);
      expect(user.notification.errors.get("googleId")).toContain(
        "Only digits are allowed in googleId",
      );
    });

    it("should add error when googleId isn't exactly 21 digits", () => {
      const user = UserFactory.fake()
        .oneUser()
        .withGoogleId("1".repeat(20))
        .build();

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.size).toBe(1);
      expect(user.notification.errors.get("googleId")).toContain(
        "googleId must be exactly 21 digits",
      );

      const user2 = UserFactory.fake()
        .oneUser()
        .withGoogleId("1".repeat(22))
        .build();

      expect(user2.notification.hasErrors()).toBe(true);
      expect(user2.notification.errors.size).toBe(1);
      expect(user2.notification.errors.get("googleId")).toContain(
        "googleId must be exactly 21 digits",
      );
    });

    it("should add error when email is invalid", () => {
      const user = UserFactory.fake()
        .oneUser()
        .withEmail("invalid-email")
        .build();

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.size).toBe(1);
      expect(user.notification.errors.get("email")).toContain(
        "email must be an email",
      );
    });

    it("should add error when email is empty", () => {
      const user = UserFactory.fake().oneUser().withEmail("").build();

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.size).toBe(1);
      expect(user.notification.errors.get("email")).toContain(
        "email should not be empty",
      );
    });

    it("should add error when name is empty", () => {
      const user = UserFactory.fake().oneUser().withName("").build();

      expect(user.notification.hasErrors()).toBe(true);
      expect(user.notification.errors.size).toBe(1);
      expect(user.notification.errors.get("name")).toContain(
        "name should not be empty",
      );
    });
  });
});
