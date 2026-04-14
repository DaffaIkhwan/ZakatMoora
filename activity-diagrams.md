@startuml
skinparam class {
    BackgroundColor #FEFECE
    ArrowColor #A80036
    BorderColor #A80036
}
skinparam shadowing false
hide circle

title Class Diagram - Sistem Seleksi Zakat Produktif MOORA

class User {
  +id : String
  +username : String
  +password : String
  +name : String
  +email : String?
  +role : String
  +isActive : Boolean
  +createdAt : DateTime
  --
  +login() : Boolean
  +register() : void
  +updateProfile() : void
  +resetPassword() : void
}

class Mustahik {
  +id : String
  +userId : String?
  +nik : String?
  +name : String
  +address : String
  +phone : String
  +businessStatus : BusinessStatus
  +registeredDate : DateTime
  --
  +submitApplication() : void
  +updateBusinessStatus(status: BusinessStatus) : void
  +viewRecipientHistory() : List<RecipientHistory>
}

class Muzakki {
  +id : String
  +userId : String?
  +nik : String?
  +name : String
  +address : String
  +phone : String
  +job : String?
  +institution : String?
  +registeredDate : DateTime
  --
  +createZakat(amount: Decimal, programId: String) : Zakat
  +viewDashboard() : DashboardData
  +viewZakatHistory() : List<Zakat>
}

class AidProgram {
  +id : String
  +name : String
  +description : String
  +totalBudget : Decimal
  +budgetPerRecipient : Decimal
  +quota : Int
  +startDate : DateTime
  +endDate : DateTime
  +status : String
  +selectedCandidates : Json?
  +createdAt : DateTime
  --
  +createProgram() : void
  +updateProgramStatus() : void
  +calculateMooraRanking() : List<Mustahik>
  +allocateFunds(mustahikId: String) : void
}

class Criterion {
  +id : String
  +code : String
  +name : String
  +weight : Float
  +type : String
  +description : String?
  +icon : String?
  +color : String?
  --
  +updateWeight(newWeight: Float) : void
  +addCriterion() : void
}

class SubCriterion {
  +id : String
  +criterionId : String
  +aspect : String
  +name : String
  +label : String
  +value : Int
  --
  +addSubCriterion() : void
  +updateValue() : void
}

class MustahikScore {
  +id : String
  +mustahikId : String
  +subCriterionId : String
  --
  +recordScore() : void
  +updateScore() : void
}

class RecipientHistory {
  +id : String
  +mustahikId : String
  +programId : String
  +amount : Decimal
  +receivedDate : DateTime
  +mooraScore : Float
  +rank : Int?
  +notes : String?
  --
  +recordDistribution() : void
  +generateReport() : Document
}

class MonitoringData {
  +id : String
  +mustahikId : String
  +programId : String
  +monitoringDate : DateTime
  +businessProgress : Json
  +socialEconomicCondition : Json
  +challenges : String?
  +achievements : String?
  +nextPlan : String?
  +surveyor : String?
  +notes : String?
  --
  +createMonitoringRecord() : void
  +updateProgress() : void
}

class Zakat {
  +id : String
  +muzakkiId : String
  +programId : String
  +amount : Decimal
  +zakatDate : DateTime
  +paymentMethod : String?
  +status : String?
  +snapToken : String?
  +notes : String?
  --
  +processPayment() : Boolean
  +verifyStatus() : String
  +generateReceipt() : Document
}

enum BusinessStatus {
  belum_usaha
  rintisan
  berkembang
  maju
}

' Relasi User (Akun Login)
User "1" -- "0..1" Mustahik : > has profile
User "1" -- "0..1" Muzakki : > has profile

' Relasi Kriteria & Skor
Criterion "1" *-- "1..*" SubCriterion : > consists of
SubCriterion "1" -- "0..*" MustahikScore : < belongs to
Mustahik "1" -- "0..*" MustahikScore : > has scores

' Relasi Penerima Bantuan
Mustahik "1" -- "0..*" RecipientHistory : > receives
AidProgram "1" -- "0..*" RecipientHistory : > distributes to

' Relasi Monitoring
Mustahik "1" -- "0..*" MonitoringData : > is monitored
AidProgram "1" -- "0..*" MonitoringData : > tracks progress

' Relasi Zakat / Donasi
Muzakki "1" -- "0..*" Zakat : > gives
AidProgram "1" -- "0..*" Zakat : > receives fund from

@enduml
