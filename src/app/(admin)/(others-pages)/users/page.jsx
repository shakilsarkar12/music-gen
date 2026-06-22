import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersTable from "@/components/tables/UsersTable";
import React from "react";

export const metadata = {
  title: "Users Management | Admin Dashboard",
  description: "View and manage all users",
};

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Users" />
      <UsersTable />
    </div>
  );
}
