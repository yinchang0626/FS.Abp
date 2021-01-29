﻿//------------------------------------------------------------------------------
// This is auto-generated code.
//------------------------------------------------------------------------------
// This code was generated by Entity Developer tool using the template for generating AbpSettings.
// 420.0.1
//
// Changes to this file may cause incorrect behavior and will be lost if
// the code is regenerated.
//------------------------------------------------------------------------------
using FS.Abp.Emailing.Dtos;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace FS.Abp.Emailing
{
    public partial class EmailSettingsAppService : ApplicationService, IEmailSettingsAppService // auto-generated
    {
        protected IEmailSettingsFactory Factory => this.LazyServiceProvider.LazyGetRequiredService<IEmailSettingsFactory>();

        public async Task<EmailSettingsDto> GetAsync(EmailSettingsGetDto EmailSettingsGet = null, bool fallback = true)
        {
            EmailSettingsDto result = new EmailSettingsDto();
            return ObjectMapper.Map(await Factory.GetAsync(EmailSettingsGet.ProviderName,EmailSettingsGet.ProviderKey), result);
        }

        public async Task UpdateAsync(EmailSettingsDto EmailSettings, string providerName = null, string providerKey = null)
        {
            var domain = new EmailSettings();

            ObjectMapper.Map(EmailSettings, domain);

            await Factory.SetAsync(domain, providerName, providerKey);

        }
    }
}
