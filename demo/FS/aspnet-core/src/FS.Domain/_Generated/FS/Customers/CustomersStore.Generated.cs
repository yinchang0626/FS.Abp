﻿//------------------------------------------------------------------------------
// This is auto-generated code.
//------------------------------------------------------------------------------
// This code was generated by YinChang.
// 4.0.0
//
// Changes to this file may cause incorrect behavior and will be lost if
// the code is regenerated.
//------------------------------------------------------------------------------
using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Services;

namespace FS.Customers
{
    public partial interface ICustomersStore : IDomainService //auto-generated
    {
        ICustomerRepository Customer { get; }
    }
    public partial class CustomersStore : DomainService //auto-generated
    {
        private ICustomerRepository _customer;
        public ICustomerRepository Customer => this.LazyGetRequiredService(ref _customer);
    }
}
