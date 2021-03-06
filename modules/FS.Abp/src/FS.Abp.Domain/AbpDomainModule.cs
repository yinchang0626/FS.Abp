﻿using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace FS.Abp
{
    [DependsOn(
        typeof(AbpDddDomainModule),
        typeof(AbpDomainSharedModule),
        typeof(Volo.Abp.Specifications.AbpSpecificationsModule),
        typeof(Volo.Abp.SettingManagement.AbpSettingManagementDomainModule)
    )]
    [DependsOn(
        typeof(EasyAbp.Abp.Trees.AbpTreesDomainModule)
        )]
    public class AbpDomainModule : AbpModule
    {

    }
}
