CREATE TABLE UserType (
    UserTypeId INT PRIMARY KEY IDENTITY(1,1),
    UserType VARCHAR(20) NOT NULL CHECK (UserType IN ('Admin', 'User', 'Company'))
);

CREATE TABLE [User] (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    UserType INT NOT NULL,
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    UserName VARCHAR(255) NOT NULL UNIQUE,
    EmailAddress VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(500) NOT NULL,
    FOREIGN KEY (UserType) REFERENCES UserType(UserTypeId)
);

CREATE TABLE Company (
    CompanyId INT PRIMARY KEY IDENTITY(1,1),
    CompanyName VARCHAR(255) NOT NULL,
    TaxNumber VARCHAR(11) NOT NULL UNIQUE,
    City VARCHAR(255) NOT NULL,
    Street VARCHAR(50) NOT NULL,
    PostCode INT NOT NULL
);

CREATE TABLE UserCompany (
    UserId INT NOT NULL,
    CompanyId INT NOT NULL,
    PRIMARY KEY (UserId, CompanyId),
    FOREIGN KEY (UserId) REFERENCES [User](UserId),
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId)
);

CREATE TABLE ServiceType (
    ServiceTypeId INT PRIMARY KEY IDENTITY(1,1),
    ServiceTypeName VARCHAR(255) NOT NULL
);

CREATE TABLE ServiceTypeCompany (
    CompanyId INT NOT NULL,
    ServiceTypeId INT NOT NULL,
    PRIMARY KEY (CompanyId, ServiceTypeId),
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId),
    FOREIGN KEY (ServiceTypeId) REFERENCES ServiceType(ServiceTypeId)
);

CREATE TABLE Service (
    ServiceId INT PRIMARY KEY IDENTITY(1,1),
    CompanyId INT NOT NULL,
    ServiceTypeId INT NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Description VARCHAR(1000),
    NetPrice INT NOT NULL,
    GrossPrice INT NOT NULL,
    VatPercentage INT NOT NULL,
    ServiceDuration INT NOT NULL,
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId),
    FOREIGN KEY (ServiceTypeId) REFERENCES ServiceType(ServiceTypeId)
);

CREATE TABLE DiscountCode (
    DiscountId INT PRIMARY KEY IDENTITY(1,1),
    CompanyId INT NOT NULL,
    DiscountCode VARCHAR(50) NOT NULL UNIQUE,
    DiscountPercentage INT NOT NULL CHECK (DiscountPercentage >= 0 AND DiscountPercentage <= 100),
    ValidFrom DATE NOT NULL,
    ValidUntil DATE NOT NULL,
    IsActive BIT NOT NULL,
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId)
);

CREATE TABLE Booking (
    BookingId INT PRIMARY KEY IDENTITY(1,1),
    ServiceId INT NOT NULL,
    UserId INT NOT NULL,
    DiscountCodeId INT NULL,
    TotalPrice INT NOT NULL,
    TotalDiscountedPrice INT NULL,
    BookedTime DATETIME NOT NULL,
	StatusId INT NOT NULL DEFAULT 1, -- default: Pending
    FOREIGN KEY (ServiceId) REFERENCES Service(ServiceId),
    FOREIGN KEY (UserId) REFERENCES [User](UserId),
    FOREIGN KEY (DiscountCodeId) REFERENCES DiscountCode(DiscountId),
	FOREIGN KEY (StatusId) REFERENCES AppointmentStatus(StatusId)
);

CREATE TABLE AppointmentStatus (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusName VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE AppointmentHistory (
    HistoryId INT PRIMARY KEY IDENTITY(1,1),
    BookingId INT NOT NULL,
    StatusId INT NOT NULL,
    ChangedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ChangedByUserId INT,
    FOREIGN KEY (BookingId) REFERENCES Booking(BookingId),
    FOREIGN KEY (StatusId) REFERENCES AppointmentStatus(StatusId),
    FOREIGN KEY (ChangedByUserId) REFERENCES [User](UserId)
);


CREATE TABLE CompanyUnavailableDates (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CompanyId INT NOT NULL,
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME NOT NULL,
    Reason VARCHAR(255),
    FOREIGN KEY (CompanyId) REFERENCES Company(CompanyId)
);

CREATE TABLE NotificationLog (
    NotificationId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    BookingId INT NULL,
    NotificationType VARCHAR(50) NOT NULL, -- pl. 'Reminder', 'StatusChange', stb.
    SentAt DATETIME NOT NULL DEFAULT GETDATE(),
    Channel VARCHAR(50) NOT NULL, -- pl. 'Email', 'Push'
    Content VARCHAR(1000),
    FOREIGN KEY (UserId) REFERENCES [User](UserId),
    FOREIGN KEY (BookingId) REFERENCES Booking(BookingId)
);

CREATE TABLE UserPreferences (
    UserId INT PRIMARY KEY,
    PreferredLanguage VARCHAR(10) DEFAULT 'en',
    ReceiveEmailNotifications BIT DEFAULT 1,
    ReceivePushNotifications BIT DEFAULT 1,
    TimeZone VARCHAR(100) DEFAULT 'UTC',
    FOREIGN KEY (UserId) REFERENCES [User](UserId)
);

-- -------------------
-- Indexelések
-- -------------------

-- User - Keresés felhasználónévre, emailre
CREATE UNIQUE INDEX IX_User_UserName ON [User](UserName);
CREATE UNIQUE INDEX IX_User_EmailAddress ON [User](EmailAddress);

-- Company - adószám egyediség
CREATE UNIQUE INDEX IX_Company_TaxNumber ON Company(TaxNumber);

-- Service - név alapján
CREATE INDEX IX_Service_Name ON Service(Name);

-- DiscountCode - kód alapján
CREATE UNIQUE INDEX IX_DiscountCode_Code ON DiscountCode(DiscountCode);

-- Booking - Lekérdezés BookedTime alapján (idõalapú listázás)
CREATE INDEX IX_Booking_BookedTime ON Booking(BookedTime);

-- Idõintervallumos lekérdezésekhez
CREATE INDEX IX_CompanyUnavailableDates_CompanyTime ON CompanyUnavailableDates(CompanyId, StartDateTime, EndDateTime);

-- User és SentAt alapján keresés
CREATE INDEX IX_NotificationLog_UserDate ON NotificationLog(UserId, SentAt);
