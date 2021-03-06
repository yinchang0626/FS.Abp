﻿//------------------------------------------------------------------------------
// This is auto-generated code.
//------------------------------------------------------------------------------
// This code was generated by Entity Developer tool using EF Core template.
// 420.0.1
//
// Changes to this file may cause incorrect behavior and will be lost if
// the code is regenerated.
//------------------------------------------------------------------------------

using System;
using Microsoft.EntityFrameworkCore;
using Volo.Abp;
namespace FS.Abp.EntityFrameworkCore
{
    public static class AbpDbContextModelCreatingExtensions
    {
        public static void ConfigureAbp(
            this ModelBuilder builder,
            Action<AbpModelBuilderConfigurationOptions> optionsAction = null)
        {
            Check.NotNull(builder, nameof(builder));

            var options = new AbpModelBuilderConfigurationOptions(
                AbpDbProperties.DbTablePrefix,
                AbpDbProperties.DbSchema
            );

            optionsAction?.Invoke(options);

            builder.Ignore<FS.Abp.Emailing.EmailSettings>();
            builder.Ignore<FS.Abp.Emailing.Smtp>();
        }
    }
}
