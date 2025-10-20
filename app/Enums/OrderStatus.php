<?php

namespace App\Enums;

enum OrderStatus: string
{
  case PENDING = 'pending';
  case ACCEPTED = 'accepted';
  case PREPARING = 'preparing';
  case READY = 'ready';
  case SERVED = 'served';
  case CANCELLED = 'cancelled';
}
