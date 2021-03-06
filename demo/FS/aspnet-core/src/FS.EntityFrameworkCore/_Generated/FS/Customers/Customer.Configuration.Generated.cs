﻿//------------------------------------------------------------------------------
// This is auto-generated code.
//------------------------------------------------------------------------------
// This code was generated by Entity Developer tool using EF Core template.
// 4.2.0
//
// Changes to this file may cause incorrect behavior and will be lost if
// the code is regenerated.
//------------------------------------------------------------------------------

using System;
using System.Data;
using System.ComponentModel;
using System.Linq;
using System.Linq.Expressions;
using System.Data.Common;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Volo.Abp.EntityFrameworkCore.Modeling;
using FS.EntityFrameworkCore;

namespace FS.Customers
{
    public partial class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {
        private FSModelBuilderConfigurationOptions options;
        public CustomerConfiguration(FSModelBuilderConfigurationOptions options)
        {
            this.options = options;
        }
        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            builder.ToTable(options.TablePrefix + @"Customers", options.Schema);
            builder.HasDiscriminator(x => x.Discriminator).HasValue<FS.Customers.Customer>((FS.Customers.CustomerDiscriminator)0).HasValue<FS.Customers.Enterprise>((FS.Customers.CustomerDiscriminator)2).HasValue<FS.Customers.Person>((FS.Customers.CustomerDiscriminator)1);
            builder.Property<string>(x => x.Phone).HasColumnName(@"Phone").IsRequired().ValueGeneratedNever();
            builder.Property<string>(x => x.Email).HasColumnName(@"Email").IsRequired().ValueGeneratedNever();
            builder.Property<FS.Customers.CustomerDiscriminator>(x => x.Discriminator).HasColumnName(@"Discriminator").IsRequired().ValueGeneratedNever();
            builder.Property<System.Guid?>(x => x.TenantId).HasColumnName(@"TenantId").ValueGeneratedNever();
            builder.HasKey(@"Id");

            builder.ConfigureAuditedAggregateRoot();
            builder.HasIndex(x => x.CreationTime);

            CustomizeConfiguration(builder);
        }

        #region Partial Methods

        partial void CustomizeConfiguration(EntityTypeBuilder<Customer> builder);

        #endregion
    }

}
