import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Dashboard from './views/Dashboard';
import Login from './views/Login';
import Logout from './views/Logout';
import GuestLayout from './components/GuestLayout';
import DefaultLayout from './components/DefaultLayout';
import ProtectedRoute from './components/ProtectedRoute';

import RequestRepairForm from './views/InspectionFormRequest';
import MyRequestForm from './views/MyRequest';
import RequestFormFacility from './views/RequestForFacilityVenue';
import RequestVehicleSlipForm from './views/RequestForVehicleSlipForm';
import RequestEquipmentForm from './views/RequestForEquipment';
import MyEquipmentForm from './views/MyEquipementForm';
import RepairRequestForm from './views/RepairFormList';
import FacilityFormForm from './views/FacilityVenueFormList';
import VehicleSlipFormList from './views/VehicleSlipFormList';
import EquipmentFormList from './views/EquipmentFormList';
import PrepostRepairForm from './views/PrePostRepairForm';
import FacilityVenueForm from './views/FacilityVenueForm';
import VehicleSlipForm from './views/VehicleSlipForm';
import EquipmentForm from './views/EquipmentForm';
import UsersList from './views/UserList';
import UserDetails from './views/UserDetails';
import UserAssign from './views/UserAssign';
import UserRegistration from './views/UserRegistration';
import NewPassword from './views/NewPassword';
import Forbidden from './components/403';
import NotFound from './components/404';

const routes = [
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Navigate to="/" />
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "/requestinspectionform",
        element: (
          <ProtectedRoute>
            <RequestRepairForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/facilityrequestform",
        element: (
          <ProtectedRoute>
            <RequestFormFacility />
          </ProtectedRoute>
        )
      },
      {
        path: "/vehiclesliprequestform",
        element: (
          <ProtectedRoute>
            <RequestVehicleSlipForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/equipmentrequestform/:id",
        element: (
          <ProtectedRoute>
            <RequestEquipmentForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/myrequest/:id",
        element: (
          <ProtectedRoute>
            <MyRequestForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/myequipmentform/:id",
        element: (
          <ProtectedRoute>
            <MyEquipmentForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/repairrequestform",
        element: (
          <ProtectedRoute>
            <RepairRequestForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/facilityvenuerequestform",
        element: (
          <ProtectedRoute>
            <FacilityFormForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/vehiclesliprequestformlist",
        element: (
          <ProtectedRoute>
            <VehicleSlipFormList />
          </ProtectedRoute>
        )
      },
      {
        path: "/equipmentrequestform",
        element: (
          <ProtectedRoute>
            <EquipmentFormList />
          </ProtectedRoute>
        )
      },
      {
        path: "/repairinspectionform/:id",
        element: (
          <ProtectedRoute>
            <PrepostRepairForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/facilityvenueform/:id",
        element: (
          <ProtectedRoute>
            <FacilityVenueForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/vehicleslipform/:id",
        element: (
          <ProtectedRoute>
            <VehicleSlipForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/equipmentform/:id",
        element: (
          <ProtectedRoute>
            <EquipmentForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/ppauserlist",
        element: (
          <ProtectedRoute>
            <UsersList />
          </ProtectedRoute>
        )
      },
      {
        path: "/ppauserdetails/:id",
        element: (
          <ProtectedRoute>
            <UserDetails />
          </ProtectedRoute>
        )
      },
      {
        path: "/ppauserassign",
        element: (
          <ProtectedRoute>
            <UserAssign />
          </ProtectedRoute>
        )
      },
      {
        path: "/pparegistration",
        element: (
          <ProtectedRoute>
            <UserRegistration />
          </ProtectedRoute>
        )
      },
    ]
  },
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/logout",
        element: <Logout />
      },
      {
        path:"/newpassword",
        element: <NewPassword />
      },
    ]
  },
  {
    path: '/forbidden',
    element: <Forbidden />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

const router = createBrowserRouter(routes);

export default router;
