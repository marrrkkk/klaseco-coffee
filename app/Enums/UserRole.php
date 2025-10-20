<?php

namespace App\Enums;

enum UserRole: string
{
  case CUSTOMER = 'customer';
  case CASHIER = 'cashier';
  case OWNER = 'owner';
  case ADMIN = 'admin';
}
